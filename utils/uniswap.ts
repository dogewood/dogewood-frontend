import { ApolloClient, InMemoryCache, gql  } from '@apollo/client';
import BigNumber from 'bignumber.js';

// NOTE: This supports only mainnet uniswap data fetching
export const graphClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  // fetchOptions: {
  //   mode: 'no-cors'
  // },
  cache: new InMemoryCache()
});


function setCacheValue(key, value) {
  if (localStorage !== undefined) {
    localStorage.setItem(key, value)
  }
}

function getCacheValue(key, defaultValue = '0') {
  if (localStorage !== undefined) {
    return localStorage.getItem(key) || defaultValue
  }
  return defaultValue
}

export async function getTokenPriceUSD(tokenAddress) {
  const cacheKey = `TOKEN_PRICE_USD-${tokenAddress.toLowerCase()}`
  try {
    const { data } = await graphClient.query({
      query: gql`
      {
        token(id: "${tokenAddress.toLowerCase()}"){
          derivedETH
        }
        bundle(id: "1") {
          ethPrice
        }
      }`
    })
    const derivedETH = data?.token?.derivedETH
    const ethPrice = data?.bundle?.ethPrice

    const result = new BigNumber(derivedETH || 0).multipliedBy(ethPrice || 0).toString()
    setCacheValue(cacheKey, result);
    return result;
  } catch (err) {
    return getCacheValue(cacheKey);
  }
}

export async function getPoolLiquidityUSD(poolAddress) {
  const cacheKey = `POOL_LIQUIDITY_USD-${poolAddress.toLowerCase()}`
  try {
    const { data } = await graphClient.query({
      query: gql`
      {
        pair(id: "${poolAddress.toLowerCase()}") {
          reserveUSD
        }
      }
      `
    });
    const result = new BigNumber(data?.pair?.reserveUSD || 0).toString()
    setCacheValue(cacheKey, result);
    return result
  } catch (err) {
    return getCacheValue(cacheKey);
  }
}