import BigNumber from "bignumber.js"
import BridgeHistoryModal from "components/Modal/BridgeHistoryModal"
import Game from "components/Training/Game"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import styles from "styles/Home.module.css"
import { getNFTInfo } from "utils/library"

const FETCH_TIME = 3
let nftTimer = null
let imageTimer = null
const game = ({ library, state, networks, dispatch, connectWallet }) => {
  const [currentImgIndex, setCurrentImageIndex] = useState(1)
  const [assetInfo, setAssetInfo] = useState({ symbol: "doge" })

  // Redirect user from network other then Polygon
  const router = useRouter()
  const isPolygon = (network) => [137, 80001].includes(network)
  useEffect(() => {
    !isPolygon && router.push("/")
  }, [])

  useEffect(() => {
    if (imageTimer) clearInterval(imageTimer)
    imageTimer = setInterval(() => {
      setCurrentImageIndex(((currentImgIndex + 1) % 3) + 1)
    }, 500)
    return () => imageTimer && clearInterval(imageTimer)
  }, [currentImgIndex])

  const { transactions, requests } = state
  const network = library ? library.wallet.network : ""

  const toWei = (value, decimals = 18) =>
    decimals < 18
      ? new BigNumber(value).times(10 ** decimals).toString(10)
      : library.web3.utils.toWei(value)
  const account = library ? library.wallet.address : ""

  const loadInfo = () => {
    getNFTInfo(library, dispatch)
  }

  useEffect(() => {
    if (library) {
      if (nftTimer) clearInterval(nftTimer)
      nftTimer = setInterval(loadInfo, FETCH_TIME * 1000)
      loadInfo()
    }
    return () => nftTimer && clearInterval(nftTimer)
  }, [library])

  const transactionMap = transactions.reduce(
    ([stakes], [hash, type, ...args]) => {
      const transaction = {
        stakes: {},
      }
      switch (type) {
        case "buy":
          transaction.stakes[args[0]] = hash
          break
        default:
          break
      }
      return [{ ...stakes, ...transaction.stakes }]
    },
    new Array(4).fill({})
  )

  const handleTransaction =
    (type, ...args) =>
    (transaction, callback = () => {}) => {
      dispatch({
        type: "txRequest",
        payload: [type, true, ...args],
      })
      transaction
        .on("transactionHash", function (hash) {
          dispatch({
            type: "txHash",
            payload: [hash, false, type, ...args],
          })
        })
        .on("receipt", function (receipt) {
          dispatch({
            type: "txHash",
            payload: [receipt.transactionHash, true, type, callback()],
          })
        })
        .on("error", (err, receipt) => {
          if (err && err.message) {
            console.log(err.message)
          }
          if (receipt) {
            dispatch({
              type: "txHash",
              payload: [receipt.transactionHash, true, type],
            })
          } else {
            dispatch({
              type: "txRequest",
              payload: [type, false, ...args],
            })
          }
        })
    }

  const handleBuy = (form) => {
    if (!library) return null
    if (
      window.ethereum &&
      !networks.includes(state.account.network) &&
      account
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === "dev" ? "Goerli Testnet" : "Ethereum Mainnet"
        }!`,
        options
      )
    } else if (!account) {
      connectWallet()
    } else {
      const { ethAmount, amount } = form
      setAssetInfo({ symbol: "doge" })
      const { mintWithEth } = library.methods.Dogewood
      const transaction = mintWithEth(amount, {
        type: "0x2",
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
        value: toWei(ethAmount.toString(10), 18),
      })
      handleTransaction("buy", "doge")(transaction.send(), () => {})
    }
  }
  return (
    <section className={`${styles.content}`}>
      <Game
        library={library}
        account={account}
        balance={state.balance}
        nftInfo={state.nftInfo || {}}
        network={network}
        state={state}
        dispatch={dispatch}
      />
      <BridgeHistoryModal
        show={state.showBridgeHistory}
        // transactions={bridgeTxs}
        onCancel={() => dispatch({ type: "toggleHistoryModal" })}
        // onFinalize={handleFinalizeBridgeTx}
        dispatch={dispatch}
        network={network}
        library={library}
        account={account}
      />
    </section>
  )
}

export default game
