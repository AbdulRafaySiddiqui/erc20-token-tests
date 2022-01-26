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

let owner = '0xb35869eCfB96c27493cA281133edd911e479d0D9';
let marketing = '0xe234Adb58788EE9F02fCA8B5DB6593a26ab4FF47';
let vault = '0x66E5c73F9c0197b18C0876f2e132b164ebC4BBBb';
let buyback = "0x2A1a09a5695071dec39ADBe099aDA7d0e7F2f4e6";

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    // owner = deployer.address;

    const router = ROUTERS.PANCAKE;

    // const tokenContract = await ethers.getContractFactory('TESTX')
    // const token = await tokenContract.deploy(router, owner, marketing, vault, buyback)
    // console.log('Token: ', token.address)

    // const feeReceiver = await token.feeReceiver()
    // await sleep(10)

    await hre.run('verify:verify', {
        address: '0xA52ec757A737D37E5c8b42f1eACC129D9C81FDbd',
        constructorArguments: [router, owner, marketing, vault, buyback],
    })

    // await hre.run('verify:verify', {
    //     address: feeReceiver.address,
    //     constructorArguments: [owner, vault],
    // })

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

