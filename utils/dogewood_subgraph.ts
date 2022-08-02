import { ApolloClient, InMemoryCache, gql  } from '@apollo/client';
import BigNumber from 'bignumber.js';
import { networks } from './constants'

const graphClients = {}

export function getGraphClient(network = 1) {
  if (!graphClients[network]) {
    if (networks[network]?.subgraph) {
      const graphClient = new ApolloClient({
        uri: networks[network]?.subgraph,
        cache: new InMemoryCache()
      });
      graphClients[network] = graphClient
    }
  }
  return graphClients[network] || graphClients[1]
}


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

export async function getStats(network = 1) {
  try {
    const graphClient = getGraphClient(network);
    const { data } = await graphClient.query({
      query: gql`
      {
        stats(first: 1) {
          id
          totalSupply
          totalStaked
          uniqueOwner
        }
      }
      `
    });
    return data?.stats[0]
  } catch (err) {
    return null;
  }
}

export async function getDogesByOwner(ownerAddress='', network = 1) {
  // try {
    const graphClient = getGraphClient(network);
    const { data } = await graphClient.query({
      query: gql`
      {
        doges(first: 500, where: {
          dogeOwner: "${ownerAddress.toLowerCase()}"
        }) {
          id
          owner
          dogeOwner
        }
      }
      `
    });
    return data?.doges
  // } catch (err) {
  //   return []
  // }
}

export async function getDoges(network = 1) {
  // try {
    const graphClient = getGraphClient(network);
    const { data } = await graphClient.query({
      query: gql`
      {
        doges(first: 500) {
          id
          owner
          dogeOwner
        }
      }
      `
    });
    return data?.doges
  // } catch (err) {
  //   return []
  // }
}

// export async function getBridgeHistory(account = '', network = 1, isMain = true) {
//   try {
//     const graphClient = getGraphClient(network);
//     const { data } = await graphClient.query({
//       query: isMain ? gql`
//       {
//         stateSyncedLogs(where: {from: "${account.toLowerCase()}"}) {
//           id
//           contractAddress
//           data
//           txHash
//           timestamp
//           blockNumber
//           from
//           input
//         }
//       }
//       ` : gql`
//       {
//         messageSentLogs(where: {from: "${account.toLowerCase()}"}) {
//           id
//           message
//           txHash
//           txIndex
//           timestamp
//           blockNumber
//           from
//           input
//         }
//       }
//       `
//     });
//     return isMain? data?.stateSyncedLogs : data?.messageSentLogs
//   } catch (err) {
//     return [];
//   }
// }