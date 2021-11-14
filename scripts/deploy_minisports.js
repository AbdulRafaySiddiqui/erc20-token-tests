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


const owner = '0xc7Ef2b32351aaB9466F93c48d0D1D68130B64cc9';
const marketing = '0x3f7c59A940A761fE8670dE1721B815968E256110';
const development = '0xBBeAe0597155f1117206Ad22309D14768740fdD3';
const pinkAntiBot = '0x8EFDb3b642eb2a20607ffe0A56CFefF6a95Df002';
const minifloki = '0x48CbC7f87C657fEA3B297F658a5133a5deeF9b04'

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()

    const router = ROUTERS.PANCAKE;

    // const tokenContract = await ethers.getContractFactory('MiniSportZilla')
    // const token = await tokenContract.deploy(router, owner, marketing, development, pinkAntiBot, minifloki)
    // console.log('Token: ', token.address)


    // await sleep(20)

    await hre.run('verify:verify', {
        address: '0xd506EE6A2bb483a953EB311e9b7E5719211702D3',
        constructorArguments: [router, owner, marketing, development, pinkAntiBot, minifloki],
    })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

