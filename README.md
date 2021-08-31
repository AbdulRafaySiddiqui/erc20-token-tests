# Uniswap fork for Testing ERC20 tokens with hardhat

To use the exchange, you would first need to calculate the init code hash and replace it in the ***UniswapV2Library.sol*** at ***line no. 24***, remove the 0x before placing the hashcode.


To cacluate the hash code, run the following command.

> node scripts/calculate_init_hash.js

## Hardhat commands

You can get started with hardhat by following [HardHat Docs](https://hardhat.org/getting-started/), following are some of the useful commands that you can use

- Run tests
    > npx hardhat test

- Run scripts 
    > npx hardhat run {PATH OF SCRIPT}

    e.g

    > npx hardhat run scripts/deploy.js

- Specify network
    > npx hardhat run {PATH OF SCRIPT} --network bsc

    Network should be defined in the hardhatjs.config

- Flatten contracts
    > npx hardhat flatten {INPUT CONTRACT} > {OUTPUT FILE}
    
    e.g

    > npx hardhat flatten contracts/tokens/BankBnb/BankBnb.sol > flatten-contracts/BankBnb.sol

- Verify Contracts
    > npx hardhat verify --network mainnet {DEPLOYED_CONTRACT_ADDRESS} "Argument 1" Argument2

    Separate the arguments by space
