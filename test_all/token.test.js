const { ethers, waffle } = require('hardhat')
const { expect, use } = require('chai')
const { solidity } = require('ethereum-waffle')
const { BigNumber, utils, provider } = ethers
const { abi } = require('../artifacts/contracts/tokens/Token.sol/DividendDistributor.json')
const { abi: bep20Abi } = require('../artifacts/contracts/tokens/Token.sol/IBEP20.json')


use(solidity)

const ZERO = new BigNumber.from('0')
const ONE = new BigNumber.from('1')
const ONE_ETH = utils.parseUnits('1000', 5)
const LESS_ETH = utils.parseUnits('10', 5)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const LIQUIDITY_AMOUNT = utils.parseUnits('1000', 5)

let weth
let token
let distributor
let rewardToken1
let rewardToken2
let factory
let router
let buyPath
let sellPath
let deployer
let feeTo
let user, user2
let owner

describe('Token Test', () => {
    it('It should deploy exchange and token', async () => {
        [owner, deployer, feeTo, user, user2, marketingWallet] = await ethers.getSigners()

        const wethContract = await ethers.getContractFactory('WBNB')
        weth = await wethContract.connect(deployer).deploy()

        const factoryContract = await ethers.getContractFactory('CaramelSwapFactory')
        factory = await factoryContract.connect(deployer).deploy(feeTo.address)

        const routerContract = await ethers.getContractFactory('CaramelSwapRouter')
        router = await routerContract.connect(deployer).deploy(factory.address, weth.address)

        const rewardContract = await ethers.getContractFactory('TOKEN');
        rewardToken1 = await rewardContract.connect(deployer).deploy('R1', 'r1', deployer.address);

        const reward2Contract = await ethers.getContractFactory('TOKEN');
        rewardToken2 = await reward2Contract.connect(deployer).deploy('R2', 'r2', deployer.address);

        const tokenContract = await ethers.getContractFactory('TEST')
        token = await tokenContract.connect(deployer).deploy(router.address, rewardToken1.address, 0, 0, 0, marketingWallet.address, owner.address)

        const distributorAddress = await token.distributor();
        distributor = new ethers.Contract(distributorAddress, abi, deployer);
    })

    it('It should Add liquidity', async () => {
        const supply = await token.totalSupply();
        await token.connect(owner).approve(router.address, MAX_UINT)
        await router.connect(owner).addLiquidityETH(token.address, supply, 0, 0, owner.address, '100000000000000000', {
            value: ONE_ETH,
        })

        await rewardToken1.approve(router.address, MAX_UINT)
        await router.addLiquidityETH(rewardToken1.address, ONE_ETH, 0, 0, owner.address, '100000000000000000', {
            value: LESS_ETH,
        })

        await rewardToken2.approve(router.address, MAX_UINT)
        await router.addLiquidityETH(rewardToken2.address, ONE_ETH, 0, 0, owner.address, '100000000000000000', {
            value: LESS_ETH,
        })
    })

    it('It Should Buy Tokens from owner account', async () => {
        buyPath = [weth.address, token.address]
        await router.connect(owner).swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, deployer.address, '1000000000000000', {
            value: LESS_ETH,
        })
    })

    it('It Should not Buy Tokens from user account (trade close)', async () => {
        await expect(
            router
                .connect(user)
                .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user.address, '1000000000000000', {
                    value: LESS_ETH,
                })
        ).to.be.reverted
    })

    it('It Should not Sell Tokens from user account (trade close)', async () => {
        sellPath = [token.address, weth.address]
        const balance = await token.balanceOf(user.address)
        await token.connect(user).approve(router.address, MAX_UINT)
        await expect(
            router
                .connect(user)
                .swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, sellPath, user.address, '1000000000000000')
        ).to.be.reverted
    })

    it('It should buy tokens from user account (trade open)', async () => {
        await token.connect(owner).tradingStatus(true)
        await expect(
            router
                .connect(user)
                .swapExactETHForTokensSupportingFeeOnTransferTokens(0, buyPath, user.address, '1000000000000000', {
                    value: LESS_ETH,
                })
        )
    })

    it('It should sell tokens from user account (trade open)', async () => {
        sellPath = [token.address, weth.address]
        let balance = await token.balanceOf(user.address)
        balance = balance.div(100);
        await token.connect(user).approve(router.address, MAX_UINT)
        await expect(
            router
                .connect(user)
                .swapExactTokensForETHSupportingFeeOnTransferTokens(balance, 0, sellPath, user.address, '1000000000000000')
        )
    })

    it("It should swap tokens", async () => {
        const threshold = await token.balanceOf(token.address);
        await token.connect(owner).setSwapSettings(true, threshold, '0')
        await expect(token.transfer(user.address, '10000000'))
            .to.emit(token, 'AutoLiquify')
    })

    it('It should reward user with reward tokens', async () => {
        expect(await rewardToken1.balanceOf(user.address)).to.gt(0);
    })

    it('It should update reward token', async () => {
        await expect(distributor.connect(owner).updateRewardToken(rewardToken2.address, ONE_ETH))
            .to.emit(distributor, 'RewardTokenUpdated');
        expect(await distributor.dividendsPerShare()).to.equal(0)
    })

    it('It should remove liquidiy', async () => {
        const lp = await factory.getPair(await router.WETH(), token.address);
        const lpToken = new ethers.Contract(lp, bep20Abi, owner)
        const lpBalance = await lpToken.balanceOf(owner.address);
        await lpToken.connect(owner).approve(router.address, MAX_UINT)
        await router.connect(owner).removeLiquidityETHSupportingFeeOnTransferTokens(token.address, lpBalance.div(100), 0, 0, owner.address, '100000000000000000')
    })
})
