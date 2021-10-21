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

let rewardClaim, deployer, user;
const amount = '10000000000';
const deadline = 10000000000000;

describe('BitBook Reward Claim', () => {
    it('It should deploy contract and validate reward claim', async () => {
        [deployer, signer, user] = await ethers.getSigners()

        const sampleTokenContract = await ethers.getContractFactory('TOKEN');
        const token = await sampleTokenContract.deploy('r', 'r', deployer.address);

        const rewardClaimContract = await ethers.getContractFactory('TopHolderRewardClaim')
        rewardClaim = await rewardClaimContract.deploy(token.address)

        token.transfer(rewardClaim.address, ONE_ETH);

        await rewardClaim.grandRewardSignerRole(signer.address);

        const { chainId } = await provider.getNetwork()
        const domain = {
            name: 'REWARD_CLAIM',
            version: '1',
            chainId,
            verifyingContract: rewardClaim.address,
        }
        const types = {
            ClaimRewards: [
                { name: 'user', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ]
        }
        const message = {
            user: user.address,
            amount: amount,
            nonce: 0,
            deadline: deadline,
        }

        const signature = await signer._signTypedData(domain, types, message);
        var { v, r, s } = ethers.utils.splitSignature(signature);

        rewardClaim.claimRewards(user.address, amount, deadline, v, r, s)

        expect(ethers.utils.verifyTypedData(domain, types, message, signature)).to.equal(signer.address);
    })
})