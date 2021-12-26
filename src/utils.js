import config from './config';

export const collectTokens = async (contract, contractAccount) => {
  const maxLimit = config.maxLimitTokenCollect;
  let allTokens = [];

  let i = 0;
  while (i < contractAccount.limit) {
    let tokens = [];
    console.log('index: ', i);

    // retry if fail due gasfee limit
    try {
      // eslint-disable-next-line no-await-in-loop
      tokens = await contract.nft_tokens({
        from_index: i.toString(),
        limit: contractAccount.id === 'pluminite.near' ? maxLimit.toString() : maxLimit,
      });
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-continue
      continue;
    }

    allTokens = [...allTokens, ...tokens];
    i += maxLimit;
  }

  return allTokens;
};

export const getTokenByID = async (contract, tokenID) => {
  const token = await contract.nft_token({
    token_id: tokenID,
  });
  return token;
};
