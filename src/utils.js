/* eslint-disable camelcase */
import config from './config';

export const collectTokens = async (contract, contractAccount) => {
  const maxLimit = config.maxLimitTokenCollect;
  let allTokens = [];

  let i = 0;
  while (i < contractAccount.limit) {
    let tokens = [];
    console.log('collect index: ', i);

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

export const insertTokens = async (contract, nftContractID, tokens) => {
  console.log('insert token from: ', nftContractID);
  await contract.consume_tokens({
    nft_contract_id: nftContractID,
    tokens,
  });
};

export const updateOwnerOfToken = async (contract, nftContractID, tokenID, ownerID) => {
  console.log('update owner');
  await contract.nft_update_owner_of_token({
    nft_contract_id: nftContractID,
    token_id: tokenID,
    owner_id: ownerID,
  });
};

export const parseTokensToValidStandart = (tokens) => {
  const results = tokens.map((token) => {
    const { approved_account_ids } = token;
    const new_approved_account_ids = {};
    const approvedAccountIdsKeys = Object.keys(approved_account_ids);

    approvedAccountIdsKeys.forEach((key) => {
      new_approved_account_ids[key] = parseInt(approved_account_ids[key], 10);
    });

    // eslint-disable-next-line no-param-reassign
    token.approved_account_ids = new_approved_account_ids;

    return token;
  });

  return results;
};

export const getTokenInputKey = (nftContractID, tokenID) => `${nftContractID}:${tokenID}`;
