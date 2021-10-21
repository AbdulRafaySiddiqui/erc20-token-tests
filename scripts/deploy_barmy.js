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
        if (i === 1) {
            process.stdout.clearLine();
        }
    }
}

let owner = '0x325E0317915B84B46aC692015096955cb4201aAC';
let marketingWallet = '0x646160995C242bbaaF799cD36Ae85eBD16c3ddFD';
let charityWallet = '0x3bA65644F6B447c826642FDD43473D491bFE0e9F';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    // owner = deployer.address;
    const tokenContract = await ethers.getContractFactory('BabyArmy')
    const token = await tokenContract.deploy(ROUTERS.PANCAKE, owner, marketingWallet, charityWallet)
    console.log('Token: ', token.address)

    await sleep(10)

    await hre.run('verify:verify', {
        address: token.address,
        constructorArguments: [ROUTERS.PANCAKE, owner, marketingWallet, charityWallet],
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

