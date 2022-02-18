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

let owner = '0xf1caA131983Cd4343163602E852B5A7cdF68Fb57';
let marketing = '0x890904D52a9854035d8FdfE912822A0128018d87';
let vault = '0xAB7b0EFcb7AfB5931c2d37e8b99F611cDFDD2d47';
let anitbot = '0x8EFDb3b642eb2a20607ffe0A56CFefF6a95Df002';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    // owner = deployer.address;

    const router = ROUTERS.PANCAKE;

    const tokenContract = await ethers.getContractFactory('CryptoRunner')
    const token = await tokenContract.deploy(router, owner, marketing, vault, anitbot)
    // const token = new ethers.Contract('0x8fC7F5676d14502deBeBDa3b0dC8907CE1b6beAe', tokenContract.interface, deployer)
    console.log('Token: ', token.address)

    const feeReceiver = await token.feeReceiver()
    await sleep(100)

    await hre.run('verify:verify', {
        address: token.address,
        constructorArguments: [router, owner, marketing, vault, anitbot],
    })

    await hre.run('verify:verify', {
        address: feeReceiver,
        contract: 'contracts/tokens/CryptoRunner/CryptoRunner.sol:FeeReceiver',
        constructorArguments: [owner, vault],
    })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

