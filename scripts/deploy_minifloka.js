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


let owner = '0x0d9E211e282A0594728059A7eEEdeDa2796a599c';
let marketing = '0x1271d176c798B8F7b6B5BA659dFe6eB232D7ADE8';
let development = '0x0aC05e00F417161E47fB0052826BB2036CA5b37c';
const rewardToken = { address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43' }
const pinkAntiBot = '0x8EFDb3b642eb2a20607ffe0A56CFefF6a95Df002';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    owner = deployer.address;

    const router = ROUTERS.UNISWAP;
    const rewardInterval = 86400;

    const tokenContract = await ethers.getContractFactory('FlokiRush')
    const token = await tokenContract.deploy(ZERO_ADDRESS, ZERO_ADDRESS, rewardToken.address, router, rewardInterval, owner, marketing, development)
    console.log('Token: ', token.address)

    const rewardClaimContract = await ethers.getContractFactory('TopHolderRewardClaim')
    const rewardClam = await rewardClaimContract.deploy(token.address)//reward token
    console.log('Reward Claim: ', rewardClam.address)

    console.log('adding signer')
    await (await rewardClam.grandRewardSignerRole('0x11656d0e67B6ba0818089B41Fd2a4d18df0522df')).wait()
    console.log('set reawrd distributor')
    await (await token.setTopHolderRewardDistributor(rewardClam.address)).wait()

    console.log('minting tokens')
    await (await token.approve(rewardClam.address, ethers.constants.MaxUint256)).wait()
    console.log('deposit rewards')
    await (await rewardClam.depositReward(await token.balanceOf(deployer.address))).wait()

    await sleep(100)

    await hre.run('verify:verify', {
        contract: "contracts/tokens/FlokiRush/FlokiRush.sol:FlokiRush",
        address: token.address,
        constructorArguments: [ZERO_ADDRESS, ZERO_ADDRESS, rewardToken.address, router, rewardInterval, owner, marketing, development],
    })
    await hre.run('verify:verify', {
        address: rewardClam.address,
        constructorArguments: [token.address],
    })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

