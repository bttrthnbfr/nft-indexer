# What is This?
This is an nft-indexer to index NFTs from several sources of smart-contract, when the program starts it will collect NFT's token and insert it to oracle indexer, and then every 5 minutes will recollect again those NFT's token if the owner changed then the indexer will update/tell the oracle smart-contract to update the owner of NFT's token.

## Notes
This indexer is not production-ready, I just learned Blockchain stack in just 2 weeks now, so maybe this algorithm is not the best practice, I have a lot of concerns especially about the gas fees when calling the smart-contract.

---

## How to run

### Requirements (I just tested on my machine, maybe works in different spec/version)
- MacOS Monterey 12.01
- Node JS v15.6.0
- Docker version 20.10.11, build dea9396

Near account (privatekey & public key)
- Test account, currenty i use test account to insert NFT to oracle smartcontract (the smartcontract in the testnet too), need gass fee.
- Main account, this is used to collect NFT from several source (free gass fee because using view call).

Oracle smart contract (address)
- Deploy the oracle smart contract first to your near account (testnet)
- See the [oracle-smartcontract](https://github.com/haffjjj/oracle-smartcontract) repo.

---

### Redis
- Using docker compose to run the redis, you can change the port in file `docker-compose.yaml`
- Run redis in different terminal `docker-compose up`

---
### nft-indexer
- Copy `.env.example` to `.env`, fill the env with your value
- Install dependencys using `npm install`
- Start the indexer `npm run start`
