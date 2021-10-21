const { ethers } = require('hardhat')
const hre = require('hardhat')

const ROUTERS = {
    PANCAKE: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
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
        if (i === 1) process.stdout.clearLine();
    }
}

let owner = '0xD40CB4B51830250bfF24dd4403e14F11600C197A';
let marketingWallet = '0x4d50DA60fE164904074A78C82F6024548342b1dC';
let cakeBank = '0xc499a2E63d38dE517789037e25D69e4Fbbc55eF3';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    const router = ROUTERS.PANCAKE;
    const rewardInterval = 600;
    // owner = deployer.address;
    // const cakeContract = await ethers.getContractFactory('TOKEN')
    // const cake = await cakeContract.deploy('Test_Cake', 'TEST_CAKE')
    // console.log('Cake', cake.address)
    const cake = { address: '0x43A8B1Ff2a1F6e18f6C862bFA604Cda77455C4f9' }
    // const tokenContract = await ethers.getContractFactory('GoldenCake')
    // const token = await tokenContract.deploy(cake.address, router, rewardInterval, owner, marketingWallet, cakeBank)
    // console.log('Token: ', token.address)
    const token = { address: '0xCDE5778B21d87B484F93d0DD7a7e2037c67DDe25' }
    // await sleep(1)

    await hre.run('verify:verify', {
        address: cake.address,
        constructorArguments: ['Test_Cake', 'TEST_CAKE'],
    })

    // await sleep(10)

    await hre.run('verify:verify', {
        address: token.address,
        constructorArguments: [cake.address, router, rewardInterval, owner, marketingWallet, cakeBank],
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

