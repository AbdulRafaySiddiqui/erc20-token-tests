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

async function main() {
  //Deploy contracts
  const [deployer] = await ethers.getSigners()

  // Simple ERC20 Contract deployment
  const testTokenContract = await ethers.getContractFactory('TOKEN')
  const testToken = await testTokenContract.deploy('Testing', 'TEST')
  console.log('Test Token', testToken.address)

  // wait a bit before verifying, so the deployed contract can be detected by the api first (take some seconds, sometimes more)
  await sleep(20) // 10 seconds

  // Verify contract code
  await hre.run('verify:verify', {
    address: testToken.address,
    constructorArguments: ['Testing', 'TEST'],
  })

  // Deploy contract with library
  const libraryContract = await ethers.getContractFactory('IterableMapping')
  const library = await libraryContract.deploy()
  console.log('IterableMapping: ', library.address)

  await sleep(20)

  await hre.run('verify:verify', {
    address: library.address,
    constructorArguments: [],
  })

  const bankContract = await ethers.getContractFactory('BankBnb', {
    libraries: {
      IterableMapping: library.address, // add library address here
    }
  })
  const bnbBank = await bankContract.deploy()
  console.log('BnbBank: ', bnbBank.address)

  await sleep(20)

  await hre.run('verify:verify', {
    address: bnbBank.address,
    constructorArguments: [],
    libraries: {
      IterableMapping: library.address,
    }
  })

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

