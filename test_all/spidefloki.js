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

describe('SpideyFloki Test', () => {
    let weth, token, cake, factory, router, buyPath, sellPath, deployer, feeTo, user1, user2, feeReceiver

    it('It should deploy exchange and token', async () => {
        [deployer, owner, feeTo, user1, user2, feeReceiver] = await ethers.getSigners()

        const wethContract = await ethers.getContractFactory('WBNB')
        weth = await wethContract.deploy()

        const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
        factory = await factoryContract.deploy(feeTo.address)

        const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
        router = await routerContract.deploy(factory.address, weth.address)

        const cakeContract = await ethers.getContractFactory('TOKEN')
        cake = await cakeContract.deploy('Cake', 'CAKE', deployer.address)

        const tokenContract = await ethers.getContractFactory('SPIDEYFLOKI')
        token = await tokenContract.deploy(router.address, cake.address, owner.address, feeReceiver.address, feeReceiver.address, feeReceiver.address)

    })

    it('It should Add Spideyfloki liquidity', async () => {
        await token.connect(owner).approve(router.address, MAX_UINT)
        await router.connect(owner).addLiquidityETH(token.address, await token.totalSupply(), 0, 0, owner.address, '100000000000000000', {
            value: ONE_K_ETH,
        })
    })

    it('It should Add BUSD liquidity', async () => {
        await cake.connect(deployer).approve(router.address, MAX_UINT)
        await router.connect(deployer).addLiquidityETH(cake.address, await cake.totalSupply(), 0, 0, deployer.address, '100000000000000000', {
            value: ONE_K_ETH,
        })
    })

    it('It should buy tokens from user account and charge 11% total fee', async () => {
        await token.connect(owner).tradingStatus(true);
        await token.connect(owner).setFeeEnabled(true);
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
            const taxFee = sentAmount.mul(600).div(10000)
            const marketFee = sentAmount.mul(300).div(10000)
            const liqFee = sentAmount.mul(200).div(10000)
            expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(liqFee));
            
            
            await router
                .connect(user2)
                .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user2.address, '1000000000000000', {
                    value: ONE_ETH,
                })
    })

    it('It should sell tokens from user account and charge 16% total fee', async () => {

        sellPath = [token.address, weth.address]
        // turn the swap off to test sell fee
        await token.connect(owner).setSwapEnabled(false)
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
        const taxFee = sentAmount.mul(700).div(10000)
        const marketFee = sentAmount.mul(500).div(10000)
        const liqFee = sentAmount.mul(200).div(10000)
        const charityFee = sentAmount.mul(100).div(10000)
        const prizeFee = sentAmount.mul(100).div(10000)
        expect(sentAmount.sub(receivedAmount)).to.deep.eq(taxFee.add(marketFee).add(liqFee).add(charityFee).add(prizeFee));

        // turn swap on again
        await token.connect(owner).setSwapEnabled(true)
    })

    it('It should sell tokens from user account and swap and liquify', async () => {
        expect(await cake.balanceOf(user1.address)).to.eq(0)

        const contractBalance = await token.balanceOf(token.address)
        await token.connect(owner).setSwapThreshold(contractBalance.toString())
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user2.address)
        await token.connect(user2).approve(router.address, MAX_UINT)
        const distributor = await token.distributor();
        const distributorContract = await ethers.getContractFactory('contracts/tokens/Spideyfloki.sol:DividendDistributor')
        const contract = new ethers.Contract(distributor, distributorContract.interface, deployer)
        await expect(router
            .connect(user2)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(balance.div(100), 0, sellPath, user2.address, '1000000000000000'))
            .to.emit(token, 'AutoLiquify')
    })

    it('it should have reward token balance', async () => {
        expect(await cake.balanceOf(user1.address)).to.gt(0)
    })

    it('It should buy tokens from user account and charge 11% total fee', async () => {
        buyPath = [weth.address, token.address]
        await router
            .connect(user1)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user1.address, '1000000000000000', {
                value: ONE_ETH,
            })
    })

    it('It should sell tokens from user account and charge 16% total fee', async () => {
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user1.address)
        const sentAmount = balance.div(100);
        await token.connect(user1).approve(router.address, MAX_UINT)
        await router
            .connect(user1)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(sentAmount, 0, sellPath, user1.address, '1000000000000000')
    })

    it('It should buy tokens from user account and charge 11% total fee', async () => {
        buyPath = [weth.address, token.address]
        await router
            .connect(user1)
            .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user1.address, '1000000000000000', {
                value: ONE_ETH,
            })
    })

    it('It should sell tokens from user account and charge 16% total fee', async () => {
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user1.address)
        const sentAmount = balance.div(100);
        await token.connect(user1).approve(router.address, MAX_UINT)
        await router
            .connect(user1)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(sentAmount, 0, sellPath, user1.address, '1000000000000000')
    })
})