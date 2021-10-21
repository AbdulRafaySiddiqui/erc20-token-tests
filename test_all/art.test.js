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

let weth
let token, rewardToken
let factory
let router
let buyPath
let sellPath
let deployer
let feeTo

describe('Swap', () => {
  it('It should deploy exchange and token', async () => {
    [deployer, feeTo, owner, marketing, user, user2] = await ethers.getSigners()

    const wethContract = await ethers.getContractFactory('WBNB')
    weth = await wethContract.deploy()

    const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
    factory = await factoryContract.deploy(feeTo.address)

    const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
    router = await routerContract.deploy(factory.address, weth.address)

    const rewardContract = await ethers.getContractFactory('TOKEN');
    rewardToken = await rewardContract.deploy('R1', 'r1', deployer.address);

    const tokenContract = await ethers.getContractFactory('ART')
    token = await tokenContract.deploy(router.address, owner.address, rewardToken.address, rewardToken.address, marketing.address, 0, 0, 0)
  })

  it('It should Add liquidity', async () => {
    await token.connect(owner).approve(router.address, MAX_UINT)
    await router.connect(owner).addLiquidityETH(token.address, ONE_ETH, 0, 0, owner.address, '100000000000000000', {
      value: ONE_ETH,
    })
  })

  it('It Should Buy Tokens from deployer account', async () => {
    buyPath = [weth.address, token.address]
    await router.connect(owner).swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, owner.address, '1000000000000000', {
      value: LESS_ETH,
    })

    await rewardToken.approve(router.address, MAX_UINT)
    await router.addLiquidityETH(rewardToken.address, ONE_ETH, 0, 0, deployer.address, '100000000000000000', {
      value: ONE_ETH,
    })
  })

  it('It Should not Buy Tokens from user account', async () => {
    await expect(
      router
        .connect(user)
        .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user.address, '1000000000000000', {
          value: LESS_ETH,
        })
    ).to.be.reverted
  })

  it('It Should not Sell Tokens from user account', async () => {
    sellPath = [token.address, weth.address]
    const balance = await token.balanceOf(user.address)
    await token.connect(user).approve(router.address, MAX_UINT)
    await expect(
      router
        .connect(user)
        .swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, sellPath, user.address, '1000000000000000')
    ).to.be.reverted
  })

  it('It should buy tokens from user account', async () => {
    await token.connect(owner).tradingStatus(true);
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
        .swapExactTokensForETHSupportingFeeOnTransferTokens(balance.div(100), 0, sellPath, user.address, '1000000000000000')
    )
  })

  it('It should swap tokens', async () => {
    const balance = await token.balanceOf(user.address);
    await token.connect(owner).setSwapSettings(true, 0)
    
    expect(await rewardToken.balanceOf(marketing.address)).to.eq(0)
    expect(await rewardToken.balanceOf(user.address)).to.eq(0)
    await expect(token.connect(user).transfer(user2.address, balance))
      .to
      .emit(token, 'SwapTokenForMarketing')
      .emit(token, 'SwapTokensForAvax')
    expect(await rewardToken.balanceOf(marketing.address)).to.gt(0)
    expect(await rewardToken.balanceOf(user.address)).to.gt(0)
  })
})
