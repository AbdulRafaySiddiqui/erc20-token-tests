require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan') // need to verify smart contracts

module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {},
        testnet1: {
            url: 'REPLACE WITH YOUR REMOTE NODE URL',
            accounts: ['REPLACE WITH YOUR ACCOUNTs PRIVATE KEY'],
        },
        rinkbey: {
            url: 'REPLACE WITH YOUR REMOTE NODE URL',
            accounts: ['REPLACE WITH YOUR ACCOUNTs PRIVATE KEY'],
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: "REPLACE WITH YOUR API KEY",
    },
    // define all compiler versions here
    solidity: {
        compilers: [
            {
                version: '0.5.16',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: '0.6.12',
                settings: {
                    optimizer: {
                        enabled: false,
                        runs: 0,
                    },
                },
            },
        ],
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
    mocha: {
        timeout: 20000,
    },
}
