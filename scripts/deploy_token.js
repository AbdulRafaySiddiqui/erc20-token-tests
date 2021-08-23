const { ethers } = require('hardhat')
const hre = require('hardhat')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  //Deploy contracts
  const [deployer] = await ethers.getSigners()

  // const libraryContract = await ethers.getContractFactory('IterableMapping')
  // const library = await libraryContract.deploy()
  // console.log('IterableMapping: ', library.address)

  // await hre.run('verify:verify', {
  //   address: library.address,
  //   constructorArguments: [],
  // })

  const tokenContract = await ethers.getContractFactory('BankBnb', {
    libraries: {
      IterableMapping: '0xAb5def65ee4C490B913F6E5D905f12464E7Ba0A0',
    }
  })
  const token = await tokenContract.deploy()
  console.log('TOKEN: ', token.address)

  await sleep(15000)

  await hre.run('verify:verify', {
    address: token.address,
    constructorArguments: [],
    libraries: {
      IterableMapping: '0xAb5def65ee4C490B913F6E5D905f12464E7Ba0A0',
    }
  })

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

