const { ethers, waffle } = require('hardhat')
const { expect, use } = require('chai')
const { solidity } = require('ethereum-waffle')
const { BigNumber, utils, provider } = ethers

use(solidity)

const ZERO = new BigNumber.from('0')
const ONE = new BigNumber.from('1')
const ONE_ETH = utils.parseUnits('1000000', 5)
const LESS_ETH = utils.parseUnits('1', 5)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

let weth
let token
let factory
let router
let buyPath
let sellPath
let deployer
let feeTo
let rewardToken

describe('Swap', () => {
  it('It should deploy exchange and token', async () => {
    [deployer, feeTo, user, user2, marketing, charity] = await ethers.getSigners()

    const wethContract = await ethers.getContractFactory('WBNB')
    weth = await wethContract.deploy()

    const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
    factory = await factoryContract.deploy(feeTo.address)

    const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
    router = await routerContract.deploy(factory.address, weth.address)

    const rewardTokenContract = await ethers.getContractFactory('TOKEN')
    rewardToken = await rewardTokenContract.deploy('RT', 'rt', deployer.address);

    const tokenContract = await ethers.getContractFactory('MiniFlokiAda')
    token = await tokenContract.deploy(rewardToken.address, ZERO_ADDRESS, router.address, 0, deployer.address, marketing.address, charity.address, ZERO_ADDRESS)
  })

  it('It should Add liquidity', async () => {
    await token.approve(router.address, MAX_UINT)
    await router.addLiquidityETH(token.address, ONE_ETH, 0, 0, deployer.address, '100000000000000000', {
      value: ONE_ETH,
    })

    await rewardToken.approve(router.address, MAX_UINT)
    await router.addLiquidityETH(rewardToken.address, ONE_ETH, 0, 0, deployer.address, '100000000000000000', {
      value: ONE_ETH,
    })
  })

  it('It Should Buy Tokens from deployer account', async () => {
    buyPath = [weth.address, token.address]
    await router.swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, deployer.address, '1000000000000000', {
      value: LESS_ETH,
    })
  })

  it('It should buy tokens from user account', async () => {
    await token.setFeeActive(true);
    await expect(
      router
        .connect(user)
        .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user.address, '1000000000000000', {
          value: LESS_ETH,
        })
    )
  })

  it('It should sell tokens from user account', async () => {
    sellPath = [token.address, weth.address]
    const balance = await token.balanceOf(user.address)
    await token.connect(user).approve(router.address, MAX_UINT)
    await expect(
      router
        .connect(user)
        .swapExactTokensForETHSupportingFeeOnTransferTokens(balance.div(10000), 0, sellPath, user.address, '1000000000000000')
    )
  })

  it('It should auto liquify', async () => {
    sellPath = [token.address, weth.address]
    const balance = await token.balanceOf(user.address)
    await token.setMinTokensBeforeSwap(await token.balanceOf(token.address));
    await expect(token.connect(user).transfer(user2.address, balance.div(1000)))
      .to.emit(token, 'AutoLiquify')

  })

  it('It should have reward to claim', async () => {
    await token.transfer(DEAD_ADDRESS, await token.balanceOf(deployer.address))
    expect(await rewardToken.balanceOf(token.address)).to.gt(0);
    expect(await token.calculateReward(user.address)).to.gt(0);
  })
})
