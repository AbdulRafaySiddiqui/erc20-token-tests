const { ethers } = require('hardhat')
const hre = require('hardhat')
const { tokenToString } = require('typescript')

const ROUTERS = {
    PANCAKE: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    PANCAKE_TESTNET: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    SUSHISWAP_TESTNET: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
}

const sleep = async (s) => {
    for (let i = s; i > 0; i--) {
        process.stdout.write(`\r \\ ${i} waiting..`)
        await new Promise(resolve => setTimeout(resolve, 250));
        process.stdout.write(`\r | ${i} waiting..`)
        await new Promise(resolve => setTimeout(resolve, 250));
        process.stdout.write(`\r / ${i} waiting..`)
        await new Promise(resolve => setTimeout(resolve, 250));
        process.stdout.write(`\r - ${i} waiting..`)
        await new Promise(resolve => setTimeout(resolve, 250));
        if (i === 1) {
            process.stdout.clearLine();
        }
    }
}

let owner = '0xc9a5aE3f6D7440e56F581C1e3C95fAF21ea91D1b';
let marketingWallet = '0x8e2e77173Db2FB17ce6609aa9a95cA0Abd54E3f8';
let rewardToken = '0x92ceb4347d2eb6868b563c69d731ab9d75804983'//'0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    const router = ROUTERS.PANCAKE_TESTNET;

    const tokenContract = await ethers.getContractFactory('TEST')
    token = await tokenContract.deploy(router, rewardToken, 0, 0, 0, marketingWallet, owner)
    console.log('Token: ', token.address)

    await sleep(10)

    const distributor = await token.distributor()

    await hre.run('verify:verify', {
        address: token.address,
        constructorArguments: [router, rewardToken, 0, 0, 0, marketingWallet, owner],
    })

    await hre.run('verify:verify', {
        address: distributor,
        constructorArguments: [owner, router, rewardToken, 0, 0, 0],
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

