import styles from "styles/Home.module.css"
import TrainingPage from "components/Training/TrainingPage"
import BridgeHistoryModal from "components/Modal/BridgeHistoryModal"
import { useEffect } from "react"
import { useRouter } from "next/router"

const questing = ({ library, state, networks, dispatch, connectWallet }) => {
  const network = library ? library.wallet.network : ""
  const account = library ? library.wallet.address : ""
  const router = useRouter()

  const isPolygon = (network) => [137, 80001].includes(network)
  // Redirect user from network other then Polygon
  // useEffect(() => {
  //   isPolygon && router.push("/")
  // }, [])
  return (
    <>
      <TrainingPage isPolygon={isPolygon} />
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
    </>
  )
}

export default questing
