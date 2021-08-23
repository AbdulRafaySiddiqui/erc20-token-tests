const { keccak256 } = require('@ethersproject/solidity')
const { bytecode } = require('../artifacts/contracts/CaramelSwapPair.sol/CaramelSwapPair.json')

const main = () => {
  const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [bytecode])
  console.log(COMPUTED_INIT_CODE_HASH)
}

main()
