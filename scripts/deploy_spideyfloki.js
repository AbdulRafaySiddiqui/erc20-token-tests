const { utils } = require('ethers')
const { ethers } = require('hardhat')
const hre = require('hardhat')

const ROUTERS = {
    PANCAKE: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    PANCAKE_TESTNET: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
    UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    SUSHISWAP_TESTNET: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    PANGALIN: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106'
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
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

let owner = '0x40b64b0cfc332495Dcc65659BF0Dd405c565abf0';
let marketing = '0x07D73E9d19F808e8054aAF80235B34e99BaFb1dA';
let charity = '0x0C4cCF7EaD4418cF027ed28CD6db997DaA3aE3a3';
let prize = "0x4BD3C434e2F7835021a28961d4b044C34FCe3C1d";
let rewardToken = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    // owner = deployer.address;

    const router = ROUTERS.PANCAKE;

    // const tokenContract = await ethers.getContractFactory('SPIDEYFLOKI')
    // const token = await tokenContract.deploy(router, rewardToken, owner, marketing, charity, prize)
    // console.log('Token: ', token.address)

    // await sleep(100)

    // await hre.run('verify:verify', {
    //     address: token.address,
    //     constructorArguments: [router, rewardToken, owner, marketing, charity, prize],
    // })

    await hre.run('verify:verify', {
        address: '0x618eEEEA01F9Bba8bA901BCB3a1e61C6752aDDac',
        constructorArguments: [router, rewardToken],
    })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

