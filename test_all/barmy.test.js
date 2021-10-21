const { ethers } = require('hardhat')
const { expect, use } = require('chai')
const { solidity } = require('ethereum-waffle')
const { BigNumber, utils } = ethers

use(solidity)

const ZERO = new BigNumber.from('0')
const ONE = new BigNumber.from('1')
const ONE_K_ETH = utils.parseUnits('10000', 5)
const ONE_ETH = utils.parseUnits('100', 5)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('BabyArmy Test', () => {
    let weth, token, factory, router, buyPath, sellPath, deployer, feeTo, user1, user2

    it('It should deploy exchange and token', async () => {
        [deployer, feeTo, user1, user2, marketing, charity] = await ethers.getSigners()

        const wethContract = await ethers.getContractFactory('WBNB')
        weth = await wethContract.deploy()

        const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
        factory = await factoryContract.deploy(feeTo.address)

        const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
        router = await routerContract.deploy(factory.address, weth.address)

        const tokenContract = await ethers.getContractFactory('BabyArmy')
        token = await tokenContract.deploy(router.address, marketing.address, charity.address)
    })

    it('It should Add BARMY liquidity', async () => {
        await token.approve(router.address, MAX_UINT)
        await router.addLiquidityETH(token.address, await token.totalSupply(), 0, 0, deployer.address, '100000000000000000', {
            value: ONE_K_ETH,
        })
    })

    it('It should buy tokens from user account and charge 8% total fee', async () => {
        await token.excludeAccount(user1.address)
        await token.setFeeActive(true);
        buyPath = [weth.address, token.address]
        const pair = await token.pair()
        const pairBalanceBefore = await token.balanceOf(pair)
        await router
            .connect(user1)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user1.address, '1000000000000000', {
                value: ONE_ETH,
            })
        // validate buy fee
        const pairBalanceAfter = await token.balanceOf(pair)
        const sentAmount = pairBalanceBefore.sub(pairBalanceAfter);
        const receivedAmount = await token.balanceOf(user1.address);
        // calculate all fees separatley to avoid precision errors
        const taxFee = sentAmount.mul(200).div(10000)
        const marketFee = sentAmount.mul(300).div(10000)
        const liqFee = sentAmount.mul(200).div(10000)
        const charityFee = sentAmount.mul(100).div(10000)
        expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(liqFee).add(charityFee));
    })

    it('It should sell tokens from user account and charge 13% total fee', async () => {
        sellPath = [token.address, weth.address]
        // turn the swap off to test sell fee
        await token.setSwapEnabled(false)
        const balance = await token.balanceOf(user1.address)
        const sentAmount = balance.div(100);
        const pair = await token.pair()
        const pairBalanceBefore = await token.balanceOf(pair)
        await token.connect(user1).approve(router.address, MAX_UINT)
        await router
            .connect(user1)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(sentAmount, 0, sellPath, user1.address, '1000000000000000')
        // validate sell fee
        const pairBalanceAfter = await token.balanceOf(pair)
        const receivedAmount = pairBalanceAfter.sub(pairBalanceBefore);
        // calculate all fees separatley to avoid precision errors
        const taxFee = sentAmount.mul(200).div(10000)
        const marketFee = sentAmount.mul(500).div(10000)
        const liqFee = sentAmount.mul(200).div(10000)
        const charityFee = sentAmount.mul(200).div(10000)
        const burnFee = sentAmount.mul(200).div(10000)
        expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(liqFee).add(charityFee).add(burnFee));
        // turn swap on again
        await token.setSwapEnabled(true)
    })

    it('It should sell tokens from user account and swap and liquify', async () => {
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user1.address)
        await token.connect(user1).approve(router.address, MAX_UINT)
        await expect(router
            .connect(user1)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(balance.div(100), 0, sellPath, user1.address, '1000000000000000'))
            .to.emit(token, 'SwapAndLiquify')
    })

    it('It should transfer tokens and convert marketing tokens to bnb', async () => {
        await router
            .connect(user1)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user1.address, '1000000000000000', {
                value: ONE_ETH,
            })
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user1.address)
        await token.setMinTokensBeforeSwap(await token.totalSupply()) // block swap and liquify

        const balanceBefore = await ethers.provider.getBalance(await token.marketingWallet());
        await expect(token.connect(user1).transfer(user2.address, balance.div(100)))
            .to
            .emit(token, 'SwapTokenToBnbForCharityWallet')
            .emit(token, 'SwapTokenToBnbForMarketingWallet')
        const balanceAfter = await ethers.provider.getBalance(await token.marketingWallet());

        expect(await ethers.provider.getBalance(await token.marketingWallet())).gt(balanceAfter.sub(balanceBefore))
    })
})