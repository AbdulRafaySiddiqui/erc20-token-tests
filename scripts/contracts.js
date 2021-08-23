const contracts = [
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   bnb: "0.10578091365368528",
  //   coin: "231",
  // },
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   other: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", //eth
  //   mel: "231",
  //   coin: "0.014206247560182171",
  // },
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   other: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", //btc
  //   mel: "231",
  //   coin: "0.0008939570127335255",
  // },
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   other: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", //cake
  //   mel: "231",
  //   coin: "2.3273855702094646",
  // },
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   other: "0xba2ae424d960c26247dd6c32edc70b295c744c43", //doge
  //   mel: "231",
  //   coin: "122.42599348693714",
  // },
  // {
  //   MEL: "0x7D5bc7796fD62a9A27421198fc3c349B96cDD9Dc",
  //   other: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", //dai
  //   mel: "231",
  //   coin: "30",
  // },
  // {
  //   MATIC: '0xcc42724c6683b7e57334c4e856f4c9965ed682bd',
  //   bnb: '0.030794196',
  //   coin: '8',
  // },
  {
    BEEFY: '0xCa3F508B8e4Dd382eE878A314789373D80A5190A',
    bnb: '0.02800302572102884',
    coin: '0.008000320012800512',
  },
  {
    UNISWAP: '0xbf5140a22578168fd562dccf235e5d43a02ce9b1',
    bnb: '0.031559525',
    coin: '0.5',
  },
  {
    LITECOIN: '0x4338665cbb7b2485a8855a139b75d5e34ab0db94',
    bnb: '0.021007570333235037',
    coin: '0.04423473901503982',
  },
  {
    TRON: '0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b',
    bnb: '0.02099380641011898',
    coin: '91.87939298347702',
  },
  {
    COSMOS: '0x0eb3a705fc54725037cc9e008bdede697f62f335',
    bnb: '0.019960398',
    coin: '0.4998345896017898',
  },
  {
    BITCOIN_CASH: '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf',
    bnb: '0.02102412881714309',
    coin: '0.0122',
  },
  {
    XRP: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
    bnb: '0.02102398381539473',
    coin: '9.216',
  },
  {
    BAKE: '0xe02df9e3e622debdd69fb838bb799e3f168902c5',
    bnb: '0.021',
    coin: '3.402',
  },
  {
    INCH: '0x111111111117dc0aa78b770fa6a738034120c302',
    bnb: '0.021',
    coin: '2.52',
  },
  {
    REEF: '0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e',
    bnb: '0.021',
    coin: '406.21',
  },
  {
    DOGE: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
    bnb: '0.021',
    coin: '24.30',
  },
  {
    CARDANO: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
    bnb: '0.021',
    coin: '4.37',
  },
  //community
  {
    ZEFI: '0x0288D3E353fE2299F11eA2c2e1696b4A648eCC07',
    bnb: '0.021',
    coin: '11.93',
  },
  {
    ViraLata: '0x4c79b8c9cB0BD62B047880603a9DEcf36dE28344',
    bnb: '0.021',
    coin: '651283899',
  },
  //chiliz
  {
    MADRID: '0x25e9d05365c867e59c1904e7463af9f312296f9e',
    bnb: '0.021',
    coin: '0.707',
  },
  {
    ROMA: '0x80d5f92c2c8c682070c95495313ddb680b267320',
    bnb: '0.021',
    coin: '1.2',
  },
  {
    JUVENTUS: '0xc40c9a843e1c6d01b7578284a9028854f6683b1b',
    bnb: '0.021',
    coin: '0.82',
  },
  {
    PSG: '0xbc5609612b7c44bef426de600b5fd1379db2ecf1',
    bnb: '0.021',
    coin: '0.445',
  },
  {
    OG: '0xf05e45ad22150677a017fbd94b84fbb63dc9b44c',
    bnb: '0.021',
    coin: '1.55',
  },
  //farms
  {
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    bnb: '0.021',
    coin: '6',
  },
  {
    BTCB: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    bnb: '0.021',
    coin: '0.00017768504310766066',
  },
  {
    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    bnb: '0.021',
    coin: '0.4638',
  },
  {
    DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
    bnb: '0.021',
    coin: '0.393',
  },
  {
    ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    bnb: '0.021',
    coin: '0.002826',
  },
  {
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    bnb: '0.021',
    coin: '6',
  },
  {
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    bnb: '0.021',
    coin: '6',
  },
  {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    bnb: '0.021',
    coin: '6',
  },
  {
    REEF: '0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e',
    bnb: '0.021',
    coin: '406.21',
  },
]

export default contracts
