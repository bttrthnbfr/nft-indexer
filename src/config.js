import 'dotenv/config';

export default {
  maxLimitTokenCollect: 2, // alon alon due gas fee limit :(
  maxConcurrentJob: 10, // max queue job per execution
  maxInsertTokens: 2, // max batch(chunk) when insert token to oracle smartcontract
  contractAccounts: [
    {
      id: 'pluminite.near',
      limit: 110,
    },
    {
      id: 'x.paras.near',
      limit: 24,
    },
    {
      id: 'nft.hhsviewer.near',
      limit: 34,
    },
  ],
  oracleContract: {
    id: process.env.ORACLE_CONTRACT_ID,
  },
  near: {
    mainnet: {
      connectConfig: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.mainnet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
      },
      account: {
        id: process.env.MAIN_ID,
        privateKey: process.env.MAIN_PRIVATE_KEY,
        publicKey: process.env.MAIN_PUBLIC_KEY,
      },
    },
    testnet: {
      connectConfig: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      },
      account: {
        id: process.env.TEST_ID,
        privateKey: process.env.TEST_PRIVATE_KEY,
        publicKey: process.env.TEST_PUBLIC_KEY,
      },
    },
  },
  redis: {
    url: `redis://:@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};
