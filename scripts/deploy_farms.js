const { ethers } = require('hardhat')
const hre = require('hardhat')
const { abi } = require('../artifacts/contracts/farms/Masterchef.sol/MasterChef.json')

async function main() {
  //Deploy contracts
  // const masterchef = new ethers.Contract('0xca2478FA04f75FC0bf51CB34Ea37Be22E359FeC1', abi, deployer);
  const [deployer] = await ethers.getSigners()
  const setup = '0xce4d8C2798f3401741eE86D5bB73E0a7d307f4B7'
  const owner = '0x06441a9094b6573311133FBA29A76AB515d0967C'
  // const caramelContract = await ethers.getContractFactory('Caramel')
  // const mel = await caramelContract.deploy()
  // console.log('MEL: ', mel.address)

  const mel = { address: '0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc' }

  const referralContract = await ethers.getContractFactory('Referral')
  const refferal = await referralContract.deploy()
  console.log('Referral: ', refferal.address)

  const masterchefContract = await ethers.getContractFactory('MasterChef')
  const masterchef = await masterchefContract.deploy(mel.address, setup, owner)
  console.log('MasterChef: ', masterchef.address)

  await refferal.updateOperator(masterchef.address, true)
  console.log('added operator to referral')
  await masterchef.setMelReferral(refferal.address)
  console.log('set referral in masterchef')

  //POOL
  await masterchef.add(500, '0xcc42724c6683b7e57334c4e856f4c9965ed682bd', 500, '1000000000000000000', 43200, 0, 0) //MATIC
  console.log('MATIC')
  await masterchef.add(500, '0xCa3F508B8e4Dd382eE878A314789373D80A5190A', 500, '1000000000000000000', 43200, 0, 0) //BEEFY
  console.log('BEEFY')
  await masterchef.add(500, '0xbf5140a22578168fd562dccf235e5d43a02ce9b1', 500, '1000000000000000000', 43200, 0, 0) //UNISWAP
  console.log('UNISWAP')
  await masterchef.add(500, '0x4338665cbb7b2485a8855a139b75d5e34ab0db94', 500, '1000000000000000000', 43200, 0, 0) //LITECOIN
  console.log('LITECOIN')
  await masterchef.add(500, '0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b', 500, '1000000000000000000', 43200, 0, 0) //TRON
  console.log('TRON')
  await masterchef.add(500, '0x0eb3a705fc54725037cc9e008bdede697f62f335', 500, '1000000000000000000', 43200, 0, 0) //COSMOS
  console.log('COSMOS')
  await masterchef.add(500, '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf', 500, '1000000000000000000', 43200, 0, 0) //BITCOIN CASH
  console.log('BITCOIN CASH')
  await masterchef.add(500, '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', 500, '1000000000000000000', 43200, 0, 0) //XRP
  console.log('XRP')
  await masterchef.add(500, '0xe02df9e3e622debdd69fb838bb799e3f168902c5', 500, '1000000000000000000', 43200, 0, 0) //BAKE
  console.log('BAKE')
  await masterchef.add(500, '0x111111111117dc0aa78b770fa6a738034120c302', 500, '1000000000000000000', 43200, 0, 0) //1INCH
  console.log('1INCH')
  await masterchef.add(500, '0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e', 500, '1000000000000000000', 43200, 0, 0) //REEF
  console.log('REEF')
  await masterchef.add(500, '0xba2ae424d960c26247dd6c32edc70b295c744c43', 500, '1000000000000000000', 43200, 0, 0) //DOGE
  console.log('DOGE')
  await masterchef.add(500, '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47', 500, '1000000000000000000', 43200, 0, 0) //CARDANO
  console.log('CARDANO')

  // COMMUNITY
  await masterchef.add(500, '0x0288D3E353fE2299F11eA2c2e1696b4A648eCC07', 500, '1000000000000000000', 43200, 0, 0) //ZEFI
  console.log('ZEFI')
  await masterchef.add(500, '0x4c79b8c9cB0BD62B047880603a9DEcf36dE28344', 500, '1000000000000000000', 43200, 0, 0) //ViraLata
  console.log('ViraLata')

  // Chiliz
  await masterchef.add(500, '0x25e9d05365c867e59c1904e7463af9f312296f9e', 500, '1000000000000000000', 43200, 0, 0) //ATLETICO DE MADRID`
  console.log('MADRID')
  await masterchef.add(500, '0x80d5f92c2c8c682070c95495313ddb680b267320', 500, '1000000000000000000', 43200, 0, 0) //ROMA
  console.log('ROMA')
  await masterchef.add(500, '0xc40c9a843e1c6d01b7578284a9028854f6683b1b', 500, '1000000000000000000', 43200, 0, 0) //JUVENTUS
  console.log('JUVENTUS')
  await masterchef.add(500, '0xbc5609612b7c44bef426de600b5fd1379db2ecf1', 500, '1000000000000000000', 43200, 0, 0) //PSG
  console.log('PSG')
  await masterchef.add(500, '0xf05e45ad22150677a017fbd94b84fbb63dc9b44c', 500, '1000000000000000000', 43200, 0, 0) //OG
  console.log('OG')

  // Farms
  await masterchef.add(500, '0x5Ec90e8824cc861a74a00Ef9eA9a3839460051D6', 500, '1000000000000000000', 43200, 0, 0) //BUSD-BNB
  console.log('BUSD-BNB')
  await masterchef.add(500, '0x731B9E9b2896985f78f2ff30C64Af422cD42Ef6B', 500, '1000000000000000000', 43200, 0, 0) //BNB-BTCB
  console.log('BNB-BTCB')
  await masterchef.add(500, '0xB65288039B48340351e07c473398068fFa96e68f', 500, '1000000000000000000', 43200, 0, 0) //BNB-CAKE
  console.log('BNB-CAKE')
  await masterchef.add(500, '0x108a21DAe7939B338A90E2c23c808E0504D32a61', 500, '1000000000000000000', 43200, 0, 0) //DOT-BNB
  console.log('DOT-BNB')
  await masterchef.add(500, '0xF25C0FEeE5393A70650946d447F3899FDbc43854', 500, '1000000000000000000', 43200, 0, 0) //ETH-BNB
  console.log('ETH-BNB')
  await masterchef.add(500, '0x6ee998a4b5f95641ee094100fddace668a3a9995', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDC
  console.log('BUSD-USDC')
  await masterchef.add(500, '0x70cc6b2055efcb69015989a06555b87bb583c30e', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('BUSD-USDT')
  await masterchef.add(500, '0xc376d15d3ef808445a3f22f97a38976cc1f8e1b5', 500, '1000000000000000000', 43200, 0, 0) //DAI-BUSD
  console.log('DAI-BUSD')
  await masterchef.add(500, '0x70fD59a757567Eb412ce96b4fcd5506c90ACEDbA', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('BNB_MEL')
  await masterchef.add(500, '0x1b0623a840fA49b9dae05074547473a54cfDeB73', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('ETH_MEL')
  await masterchef.add(500, '0xC305AE0994Dc8ea919B630b34Fbf506807C35bE4', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('BTC_MEL')
  await masterchef.add(500, '0xeec8b0CB166aCF8D7DA394Bf8466FE383b97d73f', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('CAKE_MEL')
  await masterchef.add(500, '0x107981D6f5Dd7CFE9dE20171639379820572b778', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('DOGE_MEL')
  await masterchef.add(500, '0x224812e85c79eD6Ca5b5163132608341A6A53786', 500, '1000000000000000000', 43200, 0, 0) //BUSD-USDT
  console.log('DAI_MEL')
  await masterchef.add(500, '0x498b60d2b30e1b58e8ad44e6aa3b905e09fa5950', 500, '1000000000000000000', 43200, 0, 0) //CAKE-REEF
  console.log('CAKE-REEF')
  await masterchef.add(500, '0x785384a70b853b092fe6b260d6c3e8cc65739126', 500, '1000000000000000000', 43200, 0, 0) //CAKE-TRON
  console.log('CAKE-TRON')

  // await hre.run('verify:verify', {
  //   address: mel.address,
  //   constructorArguments: [],
  // })

  await hre.run('verify:verify', {
    address: masterchef.address,
    constructorArguments: [mel.address, setup, owner],
  })

  await hre.run('verify:verify', {
    address: refferal.address,
    constructorArguments: [],
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
