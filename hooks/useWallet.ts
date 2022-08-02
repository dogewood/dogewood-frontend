import { useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import NftLibrary from 'lib/index'
import { addresses } from 'utils/constants'

let web3Modal

type TWallet = [boolean, Function, Function, any]

const events = ['NewPriceOracle']

export default function useWallet(dispatch) {
  const [library, setLibrary] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: 'f76b988b6d8649e8bae2f840a110d80f', // Required
        },
      },
    }
    web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    })
  }, [])

  const handleEvent = (event) => {
    switch (event.event) {
      case 'WALLET': {
        if (event.status === 3) {
          dispatch({ type: 'disconnect' })
        } else {
          if (event.status !== 0) {
            dispatch({ type: 'account', payload: event.data })
          }
        }
        break
      }
      default: {
        if (event.event && events.includes(event.event)) {
          // console.log(event)
          // accountBalance(library, dispatch)
        }
        break
      }
    }
  }

  const initLibrary = (provider) => {
    if (library) {
      library.setProvider(provider)
    } else {
      setLibrary(
        new NftLibrary(provider, {
          onEvent: handleEvent,
          addresses,
        })
      )
    }
  }

  async function getProvider(refresh) {
    if (refresh && web3Modal) {
      web3Modal.clearCachedProvider()
    }
    try {
      setLoading(true)
      const provider = await web3Modal.connect()
      setLoading(false)
      return provider
    } catch (e) {
      setLoading(false)
      return null
    }
  }

  function connectWallet(refresh = false) {
    if(!window.ethereum) return
    getProvider(refresh).then((provider) => {
      if (provider) initLibrary(provider)
      else if (window.ethereum) initLibrary(window.ethereum)
    })
  }

  async function disconnectWallet() {
    getProvider(false).then(async (provider) => {
      if(provider && provider.close) {
        await provider.close();
        await web3Modal.clearCachedProvider();
      }
    })
  }


  const ret: TWallet = [loading, connectWallet, disconnectWallet, library]
  return ret
}
