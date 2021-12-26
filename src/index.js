import {
  connect, Contract, KeyPair, keyStores,
} from 'near-api-js';
import { collectTokens } from './utils';
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
      viewMethods: ['nft_total_supply', 'nft_tokens', 'nft_token'],
      changeMethods: [],
    },
  );

  const tokens = await collectTokens(contract, contractAccount);
  console.log(tokens);
};

const main = async () => {
  const mainConnection = await near(config.near.mainnet);
  const mainAccount = await account(mainConnection, config.near.mainnet);

  await collect(mainAccount, config.contractAccounts[2]);
};

main();
