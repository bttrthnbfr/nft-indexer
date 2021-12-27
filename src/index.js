import {
  connect, Contract, KeyPair, keyStores,
} from 'near-api-js';
import Queue from 'bull';
import { createClient } from 'redis';
import cron from 'node-cron';
import {
  collectTokens, getTokenInputKey, insertTokens, parseTokensToValidStandart, updateOwnerOfToken,
} from './utils';
import config from './config';

const near = async (network) => {
  const keyStore = new keyStores.InMemoryKeyStore();
  const PRIVATE_KEY = network.account.privateKey;
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  await keyStore.setKey(network.connectConfig.networkId, network.account.id, keyPair);

  const nearConfig = {
    keyStore,
    ...network.connectConfig,
  };
  return connect(nearConfig);
};

const account = async (nearConnection, network) => nearConnection.account(network.account.id);

const collect = async (collectAccount, contractAccount) => {
  const contract = new Contract(
    collectAccount,
    contractAccount.id,
    {
      viewMethods: ['nft_tokens'],
      changeMethods: [],
    },
  );

  const tokens = await collectTokens(contract, contractAccount);
  return tokens;
};

const processCollecting = async (
  mainAccount,
  contractAccount,
  redisClient,
  insertTokenQueue,
  updateOwnerQueue,
) => {
  let tokens = await collect(mainAccount, contractAccount);
  tokens = parseTokensToValidStandart(tokens);

  const promises = tokens.map(async (token) => {
    const key = getTokenInputKey(contractAccount.id, token.token_id);
    const owner = token.owner_id;

    const previousOwner = await redisClient.get(key);
    if (previousOwner === null) {
      // push job insert token to queue
      await insertTokenQueue.add({
        nftContractID: contractAccount.id,
        token,
      });

      await redisClient.set(key, owner);
    } else if (previousOwner !== owner) {
      // push job update owner to queue
      await updateOwnerQueue.add({
        nftContractID: contractAccount.id,
        tokenID: token.token_id,
        ownerID: owner,
      });

      await redisClient.set(key, owner);
    }
  });

  await Promise.all(promises);
};

const main = async () => {
  // testnet for oracle smartcontract
  const testConnection = await near(config.near.testnet);
  const testAccount = await account(testConnection, config.near.testnet);

  // mainnet to collect nft from main smartcontract
  const mainConnection = await near(config.near.mainnet);
  const mainAccount = await account(mainConnection, config.near.mainnet);

  // redis client to save token's owner state
  const redisClient = createClient();
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  // init queue
  const insertTokenQueue = new Queue('insert token queue', {
    redis: config.redis,
  });
  const updateOwnerQueue = new Queue('update owner queue', {
    redis: config.redis,
  });

  // contracts
  const oracleContract = new Contract(
    testAccount,
    config.oracleContract.id,
    {
      viewMethods: [],
      changeMethods: ['consume_tokens', 'nft_update_owner_of_token'],
    },
  );

  // TODO potentially race condition if the worker slow when processing queue
  insertTokenQueue.process(async (job, done) => {
    const { data } = job;
    await insertTokens(oracleContract, data.nftContractID, [data.token]);
    done();
  });
  updateOwnerQueue.process(async (job, done) => {
    const { data } = job;
    await updateOwnerOfToken(oracleContract, data.nftContractID, data.tokenID, data.ownerID);
    done();
  });
  console.log('success initialization..');

  const collectFromContracts = async () => {
    console.log('start collecting..');
    const processPromises = config.contractAccounts.map((contractAccount) => processCollecting(
      mainAccount,
      contractAccount,
      redisClient,
      insertTokenQueue,
      updateOwnerQueue,
    ));

    await Promise.all(processPromises);
  };

  // run every 5 minutes
  collectFromContracts();
  cron.schedule('*/5 * * * *', async () => {
    collectFromContracts();
  });
};

main();
