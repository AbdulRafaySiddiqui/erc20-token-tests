const ethers = require('ethers')
const REWARD_CLAIM_ABI = require('../reward_claim_abi.json')
const TOKEN_ABI = require('../token_abi.json')
const dotenv = require('dotenv');
const { Multicall } = require("ethereum-multicall");
dotenv.config();
const { BigNumber } = ethers;

const TOKEN_ADDRESS = ''

const RPC_URL = 'https://bsc-dataseed.binance.org/'

const NAME = 'REWARD_CLAIM'
const VERSION = '1'
const CHAIN_ID = 56;
const REWARD_CLAIM_ADDRESS = ''
const DEADLINE = 86400 * 7;

// user : [ {account: '0xad.. , reward: 123 } ]
const signReward = async (users = []) => {
    const provider = ethers.getDefaultProvider(RPC_URL);
    const nonces = await getUserNonces(users.map((e) => e.account));
    const deadline = Math.ceil(Date.now() / 1000) + DEADLINE;

    const domain = {
        name: NAME,
        version: VERSION,
        chainId: CHAIN_ID,
        verifyingContract: REWARD_CLAIM_ADDRESS,
    }
    const types = {
        ClaimRewards: [
            { name: 'user', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ]
    }
    const wallet = new ethers.Wallet(process.env.REWARD_SIGNER, provider);

    const signedUserRewards = users.map(async (e) => {
        const message = {
            user: e.account,
            amount: e.rewards,
            nonce: nonces[e.account],
            deadline: deadline,
        }

        const signature = await wallet._signTypedData(domain, types, message);
        const splitSignature = ethers.utils.splitSignature(signature);

        return {
            ...e,
            signature: splitSignature,
            nounce: nonces[e.account],
            deadline
        }
    })

    return signedUserRewards;
}

// accounts : ['0xad..', '0xqQ...']
const getEligiblity = (accounts = []) => {
    const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
    const call = [
        {
            reference: "lastbuy",
            contractAddress: TOKEN_ADDRESS,
            abi: TOKEN_ABI,
            calls: accounts.map((e) => {
                return {
                    reference: e,
                    methodName: "lastbuy",
                    methodParameters: [e],
                };
            }),
        },
    ];
    const data = await multicall.call(call);
    const result = data.results.lastbuy.callsReturnContext;

    const eligible = result.map((e) => {
        return { account: e.reference, eligible: new BigNumber(e.returnValues[0].hex).lt(Math.floor((new Date()).getTime() / 1000)) }
    })

    return eligible;
}

// user : [ {account: '0xad.. , amount: 123 } ]
const getUserRewards = (users = []) => {
    const provider = ethers.getDefaultProvider(RPC_URL);
    const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider)
    const currentRewardCycle = await contract.currentRewardCycle();
    const totalRewards = await contract.rewards(currentRewardCycle)
    const totalSupply = users.reduce((p, c) => p + c);
    const rewards = users.map((e) => {
        return {
            ...e,
            rewards: totalRewards.mul(e.amount).div(totalSupply)
        }
    })
    return rewards
}

// accounts : ['0xad..', '0xqQ...']
const getUserNonces = async (accounts = []) => {
    const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
    const call = [
        {
            reference: "nonces",
            contractAddress: REWARD_CLAIM_ADDRESS,
            abi: REWARD_CLAIM_ABI,
            calls: accounts.map((e) => {
                return {
                    reference: e,
                    methodName: "nonces",
                    methodParameters: [e],
                };
            }),
        },
    ];
    const data = await multicall.call(call);
    const result = data.results.nonces.callsReturnContext;

    const nounces = result.map((e) => {
        return {
            [e]: new BigNumber(e.returnValues[0].hex).toNumber()
        }
    })

    return nounces;
}


const getCurrentNounce = async (account, currentNounce) => {
    const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider)
    const currentNounce = await contract.nonces(account);
    return currentNounce;
}