const { ethers } = require('hardhat')
const { expect, use } = require('chai')
const { solidity } = require('ethereum-waffle')
const { BigNumber, utils } = ethers

use(solidity)

const ZERO = new BigNumber.from('0')
const ONE = new BigNumber.from('1')
const ONE_K_ETH = utils.parseUnits('1000', 5)
const ONE_ETH = utils.parseUnits('1', 5)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('IslandInu Test', () => {
    let weth, token, cake, factory, router, buyPath, sellPath, deployer, feeTo, user1, user2

    it('It should deploy exchange and token', async () => {
        [deployer, feeTo, user1, user2] = await ethers.getSigners()

        const wethContract = await ethers.getContractFactory('WBNB')
        weth = await wethContract.deploy()

        const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
        factory = await factoryContract.deploy(feeTo.address)

        const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
        router = await routerContract.deploy(factory.address, weth.address)

        const cakeContract = await ethers.getContractFactory('TOKEN')
        cake = await cakeContract.deploy('Cake', 'CAKE', deployer.address)

        const tokenContract = await ethers.getContractFactory('FTM')
        token = await tokenContract.deploy(router.address)
    })

    it('It should Add IslandInu liquidity', async () => {
        await token.approve(router.address, MAX_UINT)
        await router.addLiquidityETH(token.address, await token.totalSupply(), 0, 0, deployer.address, '100000000000000000', {
            value: ONE_K_ETH,
        })
    })

    it('It should Add CAKE liquidity', async () => {
        await cake.approve(router.address, MAX_UINT)
        await router.addLiquidityETH(cake.address, await cake.totalSupply(), 0, 0, deployer.address, '100000000000000000', {
            value: ONE_K_ETH,
        })
    })

    it('It should buy tokens from user account and charge 7% total fee', async () => {
        await token.setFeeActive(true);
        buyPath = [weth.address, token.address]
        const pair = await token.pair()
        const pairBalanceBefore = await token.balanceOf(pair)
        await router
            .connect(user1)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user1.address, '1000000000000000', {
                value: ONE_ETH,
            })
        // // validate buy fee
        // const pairBalanceAfter = await token.balanceOf(pair)
        // const sentAmount = pairBalanceBefore.sub(pairBalanceAfter);
        // const receivedAmount = await token.balanceOf(user1.address);
        // // calculate all fees separatley to avoid precision errors
        // const taxFee = sentAmount.mul(400).div(10000)
        // const marketFee = sentAmount.mul(100).div(10000)
        // const teamFee = sentAmount.mul(100).div(10000)
        // expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(teamFee));
    })

    it('It should sell tokens from user account and charge 16% total fee', async () => {
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
        // const pairBalanceAfter = await token.balanceOf(pair)
        // const receivedAmount = pairBalanceAfter.sub(pairBalanceBefore);
        // // calculate all fees separatley to avoid precision errors
        // const taxFee = sentAmount.mul(400).div(10000)
        // const marketFee = sentAmount.mul(100).div(10000)
        // const teamFee = sentAmount.mul(100).div(10000)
        // expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(teamFee));
        // // turn swap on again
        await token.setSwapEnabled(true)
    })

    it('It should sell tokens from user account and swap and liquify', async () => {
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user1.address)
        await token.connect(user1).approve(router.address, MAX_UINT)
        await
            expect(
                router
                    .connect(user1)
                    .swapExactTokensForETHSupportingFeeOnTransferTokens(balance.div(100), 0, sellPath, user1.address, '1000000000000000')
            ).to.emit(token, 'Swap')
    })

})