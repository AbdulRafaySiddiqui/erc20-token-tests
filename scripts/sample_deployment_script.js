const { ethers } = require('hardhat')
const hre = require('hardhat')

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

const ROUTERS = {
  PANCAKE: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  PANCAKE_TESTNET: '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
  UNISWAP: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  SUSHISWAP_TESTNET: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  PANGALIN: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
  FANTOM: '0xF491e7B69E4244ad4002BC14e878a34207E38c29'
}

async function main() {
  //Deploy contracts
  // const [deployer] = await ethers.getSigners()

  // // Simple ERC20 Contract deployment
  // const testTokenContract = await ethers.getContractFactory('TOKEN')
  // const testToken = await testTokenContract.deploy('Testing', 'TEST')
  // console.log('Test Token', testToken.address)

  // // wait a bit before verifying, so the deployed contract can be detected by the api first (take some seconds, sometimes more)
  // await sleep(20) // 10 seconds

  // // Verify contract code
  // await hre.run('verify:verify', {
  //   address: testToken.address,
  //   constructorArguments: ['Testing', 'TEST'],
  // })

  // // Deploy contract with library
  // const libraryContract = await ethers.getContractFactory('IterableMapping')
  // const library = await libraryContract.deploy()
  // console.log('IterableMapping: ', library.address)

  // await sleep(20)

  // await hre.run('verify:verify', {
  //   address: library.address,
  //   constructorArguments: [],
  // })

  // const bankContract = await ethers.getContractFactory('BankBnb', {
  //   libraries: {
  //     IterableMapping: library.address, // add library address here
  //   }
  // })
  // const bnbBank = await bankContract.deploy()
  // console.log('BnbBank: ', bnbBank.address)

  // await sleep(20)

  // await hre.run('verify:verify', {
  //   address: bnbBank.address,
  //   constructorArguments: [],
  //   libraries: {
  //     IterableMapping: library.address,
  //   }
  // })

  console.log(ethers.utils.splitSignature('0x4561164ceca172e849e1e7277209c0a3b556bc0d83e012efb1c015978c7cd17e2ecbeb00086a6650f9d98a4c38579cf33ff017fa7d496cc8641de0a73576d5ec1c'))

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

