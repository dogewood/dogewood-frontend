export function getEtherscan(hash, network = 1, type = 'tx') {
  if (network === 1) {
    return `https://etherscan.io/${type}/${hash}`
  } else if (network === 3) {
    return `https://ropsten.etherscan.io/${type}/${hash}`
  } else if (network === 4) {
    return `https://rinkeby.etherscan.io/${type}/${hash}`
  } else if (network === 5) {
    return `https://goerli.etherscan.io/${type}/${hash}`
  } else if (network === 56) {
    return `https://bscscan.com/${type}/${hash}`
  } else if (network === 97) {
    return `https://testnet.bscscan.com/${type}/${hash}`
  } else if (network === 137) {
    return `https://polygonscan.com/${type}/${hash}`
  } else if (network === 80001) {
    return `https://mumbai.polygonscan.com/${type}/${hash}`
  }
}
