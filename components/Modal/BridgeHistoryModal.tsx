import { useContext, useEffect, useState } from "react"
import Button from "components/Button/Button"
import Modal from "./Modal"
import styles from "./Modal.module.css"
import { toFixed } from "utils/number"
import { networks, supportedNetworks } from "utils/constants"
import { shorten } from "utils/string"
import moment from "moment"
import { getEtherscan } from "utils/links"
import DefenderContext from "store/store"
import { toast } from "react-toastify"
import { getDogesByOwner } from "utils/dogewood_subgraph"

interface ITransaction {
  transactions?: any[]
  show: Boolean
  // onFinalize?: Function
  onRefreshAfterTx?: Function
  onCancel?: Function
  dispatch?: any
  network?: any
  library?: any
  account?: any
}

export default function BridgeHistoryModal({
  transactions = [],
  show,
  // onFinalize,
  onRefreshAfterTx,
  onCancel,
  dispatch,
  network,
  library,
  account,
}: ITransaction) {
  const [treatAmount, setTreatAmount] = useState(0 as string | number)
  const { bridgeTXS } = useContext(DefenderContext)
  useEffect(() => {
    if (show) {
      setTreatAmount(0)
    }
  }, [show])

  const handleFinalizeBridgeTx = async (tx) => {
    console.log(tx);
    if (network !== tx.toNetwork) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `Please switch to ${networks[tx.toNetwork].name} to finalize`,
        options
      )
      return
    }
    if (
      account &&
      library?.methods?.Portal &&
      network === tx.toNetwork &&
      window?.fetch
    ) {
      let exitPayload = tx?.exitPayload
      if (!tx?.exitPayload) {
        // get exit-payload

        const url =
          tx.toNetwork === 1
            ? `https://apis.matic.network/api/v1/matic/exit-payload/${tx.txHash}?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036`
            : `https://apis.matic.network/api/v1/mumbai/exit-payload/${tx.txHash}?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036`

        try {
          exitPayload = await window
            .fetch(url)
            .then(async (res) => {
              if (res.ok) {
                return res.json()
              }
              throw new Error(res.statusText)
            })
            .then((data) => {
              return data.result
            })
        } catch (err) {
          const options = {
            autoClose: 5000,
          }
          toast.error(
            `Burn transaction has not been checkpointed yet. It might take 3 hours.`,
            options
          )
          console.log(err)
          return
        }
      }

      const { receiveMessage } = library?.methods?.Portal
      const transaction = receiveMessage(exitPayload, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })

      handleTransaction(
        `Finalizing the bridge transaction ${shorten(tx.txHash, 10)}`
      )(transaction.send(), () => {
        if (onRefreshAfterTx) onRefreshAfterTx();
      })
    }
  }

  // const getUserInfo = () => {
  //   if (library?.methods?.Treat && library?.methods?.Dogewood) {
  //     const { balanceOf, allowance } = library?.methods?.Treat
  //     const { isApprovedForAll } = library?.methods?.Dogewood
  //     if (account) {
  //       Promise.all([
  //         balanceOf(account),
  //         allowance(account, library.addresses.Dogewood),
  //         isApprovedForAll(account, library.addresses.Dogewood),
  //       ])
  //         .then(([balanceOf, allowance, isApprovedForAll]) => {
  //           setUserInfo({
  //             address: account,
  //             ethBalance: balance,
  //             treatBalance: balanceOf,
  //             allowance: allowance,
  //             isApprovedForAll: isApprovedForAll,
  //           })
  //         })
  //         .catch(console.log)
  //     }
  //   }
  // }

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
  return (
    <Modal
      show={!!show}
      onRequestClose={() => onCancel && onCancel()}
      closeOnEscape={false}
      loading={false}
      wrapperClassName={`${styles.bridgeModal} ${styles.bridgeHistoryModal}`}
      bodyClassName={styles.bridgeModalBody}
      contentClassName={styles.bridgeModalContent}
      showCloseButton={true}
    >
      <h1>BRIDGE HISTORY</h1>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <td>Transaction</td>
            <td>Date</td>
            <td>Bridge To</td>
            <td>Doge ID(s)</td>
            <td>$TREAT</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {bridgeTXS?.map((tx) => {
            const toNet = networks[tx.toNetwork]
            return (
              <tr key={tx.txHash}>
                <td>
                  <a
                    className={styles.txHash}
                    href={getEtherscan(tx.txHash, tx.fromNetwork)}
                    target="_blank"
                  >
                    {shorten(tx.txHash, 10)}
                  </a>
                </td>
                <td>
                  {moment
                    .unix(tx.blockTimestamp)
                    .utc()
                    .format("YYYY-MM-DD HH:mm:ss")}
                </td>
                <td>
                  <img
                    src={toNet.logo}
                    alt={toNet.name}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  <span style={{ verticalAlign: "middle" }}>{toNet.name}</span>
                </td>
                <td>{tx.tokenIds.join(", ")}</td>
                <td>{tx.treatAmount}</td>
                <td>
                  {tx.toNetwork === supportedNetworks[1] ? (
                    tx.status
                  ) : // polygon tx to check finalize
                  tx?.exitTxHash ? (
                    "Completed"
                  ) : (
                    <Button
                      className={styles.btnFinalize}
                      disabled={!tx?.blockIncluded}
                      onClick={() => handleFinalizeBridgeTx(tx)}
                    >
                      Finalize
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Modal>
  )
}
