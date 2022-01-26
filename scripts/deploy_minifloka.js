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


let owner = '0xAceF70308b4d7b6F79fAE717C308aCcf7bF39455';
let marketing = '0x35A31911211Fa4805B5602B2Ed06154686d45FC7';
let charity = '0x2A1a09a5695071dec39ADBe099aDA7d0e7F2f4e6';
const rewardToken = { address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47' }
const pinkAntiBot = '0x8EFDb3b642eb2a20607ffe0A56CFefF6a95Df002';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    // owner = deployer.address;

    const router = ROUTERS.PANCAKE;
    const rewardInterval = 86400;

    const tokenContract = await ethers.getContractFactory('MiniFlokiAda')
    const token = await tokenContract.deploy(rewardToken.address, ZERO_ADDRESS, router, rewardInterval, owner, marketing, charity, pinkAntiBot)
    console.log('Token: ', token.address)

    const rewardClaimContract = await ethers.getContractFactory('TopHolderRewardClaim')
    const rewardClam = await rewardClaimContract.deploy(rewardToken.address)
    console.log('Reward Claim: ', rewardClam.address)

    // await rewardClam.grandRewardSignerRole('0xb8d683Af99a82B0f52f72EB765eB81529C5B35cf')
    // await token.setTopHolderRewardDistributor(rewardClam.address)

    await sleep(10)

    await hre.run('verify:verify', {
        address: token.address,
        constructorArguments: [rewardToken.address, ZERO_ADDRESS, router, rewardInterval, owner, marketing, charity, pinkAntiBot],
    })
    await hre.run('verify:verify', {
        address: rewardClam.address,
        constructorArguments: [rewardToken.address],
    })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

