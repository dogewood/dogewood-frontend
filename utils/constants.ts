import BigNumber from "bignumber.js"

export const API_ROOT = 'https://api.dogewoodnft.com'

export const ZERO = '0x0000000000000000000000000000000000000000'

export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

export const addresses = {
  1: {
    Dogewood: '0xC84cC1111aDacE071e2a57a61c42450d4e133F16',
    Treat: '0x12D7B28a055621F4bA0C146d1728082eCF1B9390',
    Castle: '0x96c63f93B658213FF4ce366766DC915F1c1ECCcd',
    Portal: '0x44F4791D61663ff4D05EaA88E2021723716DE82B',
    NameChange: '0x0000000000000000000000000000000000000000',
    Battle: '0x0000000000000000000000000000000000000000',
    Quest: '0x0000000000000000000000000000000000000000',
    Commoners: "0x808e27B53FF68FBEe8EDdCD4119525c8485caa5C",
    Weth: "0x12D7B28a055621F4bA0C146d1728082eCF1B9390",
  },
  4: {
    Dogewood: '0x995B0092C57054C3B7d50DC14F83Ca00472c45D6',
    Treat: '0xd705C3a5eaF3e2157B9A5A75d1700D7e85588A7E',
    NameChange: '0x0000000000000000000000000000000000000000',
    Battle: '0x0000000000000000000000000000000000000000',
    Quest: '0x0000000000000000000000000000000000000000',
    Commoners: "0xAa4702a471a7c82c6e587c38CFcE9D0286498206",
    Weth: "0xd705C3a5eaF3e2157B9A5A75d1700D7e85588A7E",
  },
  5: {
    Dogewood: '0xB7b022695666BD09461a8024a8e745A3B13eFE94',
    Treat: '0x0578A20c352f8994582B01239aF564900D702115',
    Castle: '0x8e4CE8ac490EF2f5556bA48421E7457cC1EaF7db',
    Portal: '0xb2fd109b6949a361643193ad1eaAA797912D6C66',
    NameChange: '0x0000000000000000000000000000000000000000',
    Battle: '0x0000000000000000000000000000000000000000',
    Quest: '0x0000000000000000000000000000000000000000',
    Commoners: "0xBeC1C704Eecab754ccad8D2Cc3b74707481685BC",
    Weth: "0x0578A20c352f8994582B01239aF564900D702115",
  },
  137: {
    Dogewood: '0x2937320e8c03075D716de220Eda7aA0091c796FE',
    Treat: '0x5d0915f929FC090fd9c843a53e7e30335dD199bc',
    Castle: '0xb4190911DBa5Ef45366174627E2cd60103126b4c',
    Portal: '0xAc621256f124dB98475E1c42A139606389D2e7ce',
    NameChange: '0xab477eb81F7dbF070a1841ddf9E505fb4Ba52b68',
    Battle: '0xaEe4c5dff5EA6DB375DC0c850521BAbdB5A724E0',
    Quest: '0x6422283b43719B0959D27fC90a0B148f48768599',
    Items: '0x5eBae5F603aB9094441F7c05AcbCf6D179520845',
    Commoners: "0xEb2803bF61edc473E836B22dFcad1B2c9F8642aC",
    Weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
  },
  80001: {
    Dogewood: '0x43af6b32522e0894Cbfe96796e5a4273FA71AfeB',
    Treat: '0x96c63f93B658213FF4ce366766DC915F1c1ECCcd',
    Castle: '0xa2Eb421a2b4965A3C5ddD7EdE0498A4a58DD8E41',
    Portal: '0x57Df4e6fC8C357e76b68a8d8405D65723EC205Ff',
    NameChange: '0xCd7D8c1261b842bF005377Eb799003cbC9e46842',
    Battle: '0x8e094ff5EfDBc496d565f6ba2b556f4b5bf9FeE9',
    Quest: '0xA7b36920f39ce1cA4cBFc3F03E567A9842bbE111',
    Items: '0x518A8DDc4eE5d180B4a90c716a3c3e102d6afe94',
    Commoners: "0x2C5288C9E6eD1fd3736050Ca6B096ea2509EeA13",
    Weth: "0x96c63f93B658213FF4ce366766DC915F1c1ECCcd",
  }
}

export const networks = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    logo: '/assets/ethereum.png',
    subgraph: 'https://api.thegraph.com/subgraphs/name/dogewood/dogewood-subgraph',
    addresses: addresses[1],
    rpc: 'https://mainnet.infura.io/v3/204de0fe133348fe9f3df86f689d8d80'
  },
  5: {
    chainId: 5,
    name: 'Goerli',
    logo: '/assets/ethereum.png',
    subgraph: 'https://api.thegraph.com/subgraphs/name/dmitry30399/dogewood-goerli-subgraph',
    addresses: addresses[5],
    rpc: 'https://goerli.infura.io/v3/204de0fe133348fe9f3df86f689d8d80'
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    logo: '/assets/polygon.png',
    subgraph: 'https://api.thegraph.com/subgraphs/name/dogewood/dogewood-polygon-subgraph',
    addresses: addresses[137],
    // rpc: 'https://rpc-mainnet.maticvigil.com',
    rpc: 'https://polygon-mainnet.g.alchemy.com/v2/vdumaapRxt7pRMCpRH7Blp5AtbnI3eDk',
    blockIncluded: 'https://apis.matic.network/api/v1/matic/block-included/',
  },
  80001: {
    chainId: 80001,
    name: 'Mumbai',
    logo: '/assets/polygon.png',
    subgraph: 'https://api.thegraph.com/subgraphs/name/dogewood/dogewood-mumbai-subgraph',
    addresses: addresses[80001],
    // rpc: 'https://rpc-mumbai.maticvigil.com',
    rpc: 'https://polygon-mumbai.g.alchemy.com/v2/vdumaapRxt7pRMCpRH7Blp5AtbnI3eDk',
    blockIncluded: 'https://apis.matic.network/api/v1/mumbai/block-included/',
  }
}

export const supportedNetworks = process.env.APP_ENV === 'dev' ? [5, 80001] : [1, 137]

export const rerollPrices = [
  '6000000000000000000',
  '12000000000000000000',
  '24000000000000000000',
  '48000000000000000000',
  '96000000000000000000',
]

export const getRerollPrice = (count) => {
  return rerollPrices[Math.min(count, rerollPrices.length - 1)]
}

export const levelUpPrices = [
  '0',
  '12000000000000000000',
  '16000000000000000000',
  '20000000000000000000',
  '24000000000000000000',
  '30000000000000000000',
  '36000000000000000000',
  '42000000000000000000',
  '48000000000000000000',
  '54000000000000000000',
  '62000000000000000000',
  '70000000000000000000',
  '78000000000000000000',
  '86000000000000000000',
  '96000000000000000000',
  '106000000000000000000',
  '116000000000000000000',
  '126000000000000000000',
  '138000000000000000000',
  '150000000000000000000',
]

export const getLevelUpPrice = (level) => {
  return levelUpPrices[Math.min(level, levelUpPrices.length - 1)]
}

export const getRenamePrice = () => {
  return new BigNumber('3000000000000000000');
}

export const getMultipleLevelUpPrice = (curLevel, toLevel) => {
  let _price = new BigNumber(0);
  for (let i = curLevel; i < toLevel; i++) {
    _price = _price.plus(new BigNumber(levelUpPrices[Math.min(i, levelUpPrices.length - 1)]));
  }
  
  return _price.toString(10);
}

export const getRecruitPrice = (totalSupply) => {
  if (totalSupply < 2500) return '0';
  if (totalSupply < 3000) return '4000000000000000000';
  if (totalSupply < 4600) return '25000000000000000000';
  if (totalSupply < 5000) return '85000000000000000000';
  return '85000000000000000000';
}

export const breedNames = [
  "Shiba",
  "Pug",
  "Corgi",
  "Labrador",
  "Dachshund",
  "Poodle",
  "Pitbull",
  "Bulldog",
];
export const classNames = [
  "Warrior",
  "Rogue",
  "Mage",
  "Hunter",
  "Cleric",
  "Bard",
  "Merchant",
  "Forager",
];
export const attackTypes = [
  "Melee", "Magic", "Ranged"
]
export const classStats = [
  {name: "Warrior", attackType: 0},
  {name: "Rogue", attackType: 0},
  {name: "Mage", attackType: 1},
  {name: "Hunter", attackType: 2},
  {name: "Cleric", attackType: 1},
  {name: "Bard", attackType: 2},
  {name: "Merchant", attackType: 2},
  {name: "Forager", attackType: 0},
];

export const loot_boxes_data = [
  {
    id: 1,
    name: "Common Loot Box",
    image: "/loot_box/lb0.png",
    desc: "A shoddy looking loot box full of goodies.",
    use: "Can be opened in Phase 2 for Common loot.",
  },
  {
    id: 2,
    name: "Uncommon Loot Box",
    image: "/loot_box/lb1.png",
    desc: "A sturdy chest with a fair bit of heft. It feels a bit more heavy than other boxes you’ve come across. ",
    use: "Can be opened in Phase 2 for Uncommon loot.",
  },
  {
    id: 3,
    name: "Rare Loot Box",
    image: "/loot_box/lb2.png",
    desc: "A well-crafted chest.  There must be something precious inside!. ",
    use: "Can be opened in Phase 2 for Rare loot.",
  },
  {
    id: 4,
    name: "Epic Loot Box",
    image: "/loot_box/lb3.png",
    desc: "A beautiful chest that rings of value when you kick it. It feels truly… Epic. ",
    use: "Can be opened in Phase 2 for Epic loot.",
  },
  {
    id: 5,
    name: "Legendary Loot Box",
    image: "/loot_box/lb4.png",
    desc: "A magnificent chest that tingles your loins. You KNOW there’s gonna be something good in this!. ",
    use: "Can be opened in Phase 2 for Legendary loot.",
  },
  {
    id: 6,
    name: "Wooden Armor Plating",
    image: "/consumable/j0c0.svg",
    desc: "Shoddy armor plating made of scraps that protects the doge from PHYSICAL and RANGED damage by 10% for a single quest. ",
    use: "Equip this in the questing screen to use it!",
  },
  {
    id: 7,
    name: "Minor Health Potion",
    image: "/consumable/j1c0.svg",
    desc: "A small elixir with a small bit of  $TREAT in it.  A doge can drink this in a pinch to restore 25% of their health. ",
    use: "Equip this in the questing screen to use it!",
  },
  {
    id: 8,
    name: "Basic Dogewood Stew",
    image: "/consumable/j2c0.svg",
    desc: "A basic but filling meal that increases a doge’s max health by 2% for a single quest. ",
    use: "Equip this in the questing screen to use it!",
  },
]
