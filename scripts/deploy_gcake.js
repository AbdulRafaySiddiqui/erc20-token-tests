const { ethers } = require('hardhat')
const hre = require('hardhat')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let owner = '0xD40CB4B51830250bfF24dd4403e14F11600C197A';
let marketingWallet = '0x4d50DA60fE164904074A78C82F6024548342b1dC';
let cakeBank = '0xc499a2E63d38dE517789037e25D69e4Fbbc55eF3';

async function main() {
    //Deploy contracts
    const [deployer] = await ethers.getSigners()
    const router = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
    const rewardInterval = 600;
    owner = deployer.address;
    // const cakeContract = await ethers.getContractFactory('TOKEN')
    // const cake = await cakeContract.deploy('Cake', 'CAKE')
    // console.log('Cake', cake.address)

    const tokenContract = await ethers.getContractFactory('GoldenCake')
    const token = await tokenContract.deploy('0xA6839505269803F5FA0db91fc5d61b1Cc81d52FE', router, rewardInterval, owner, marketingWallet, cakeBank)
    console.log('Token: ', token.address)

    await sleep(20000)

    // await hre.run('verify:verify', {
    //     address: cake.address,
    //     constructorArguments: ['Cake', 'CAKE'],
    // })

    // await sleep(20000)

    // await hre.run('verify:verify', {
    //     address: token.address,
    //     constructorArguments: [cake.address, router, rewardInterval, owner, marketingWallet, cakeBank],
    // })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

