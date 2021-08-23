const { ethers } = require('hardhat')
const hre = require('hardhat')

async function main() {
  //Deploy contracts
  const [deployer] = await ethers.getSigners()

  // const WETH = await ethers.getContractFactory('Dummy')
  // const weth = await WETH.deploy()
  // console.log('WETH: ', weth.address)

  const weth = { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' }
  // const weth = { address: '0xae13d989dac2f0debff460ac112a837c89baa7cd' }
  const feeTo = '0xC7A787868D1b6a8aB8304ACA1324f7390657B016'
  const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
  const factory = await factoryContract.deploy(feeTo)
  console.log('Factory: ', factory.address)

  const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
  const router = await routerContract.deploy(factory.address, weth.address)
  console.log('Router: ', router.address)

  const pairContract = await ethers.getContractFactory('CaramelSwapPair')
  const pair = await pairContract.deploy()
  console.log('Pair: ', pair.address)

  await hre.run('verify:verify', {
    address: factory.address,
    constructorArguments: [feeTo],
  })

  await hre.run('verify:verify', {
    address: router.address,
    constructorArguments: [factory.address, weth.address],
  })

  await hre.run('verify:verify', {
    address: pair.address,
    constructorArguments: [],
  })

  // await hre.run('verify:verify', {
  //   address: weth.address,
  //   constructorArguments: [],
  // })

  // console.log(`const Deployer = '${deployer.address}';
  //     const WETH = '${weth.address}';
  //     const Factory = '${factory.address}';
  //     const Router = '${router.address}';
  //     const Pair = ${pair.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
// Factory:  0x4DEd9d6013A708D1Eb743086E7D8CAD436FF560d
// Router:  0x1C0a81Cc2383E2f28DF42d7E4b47a09dD9526157
// Pair:  0x6487a869D4DBA67C81733f17bc67d9350B4B28f5
