import styles from "styles/Home.module.css"
import Leaderboard from "components/Leaderboard/Leaderboard"
import BridgeHistoryModal from "components/Modal/BridgeHistoryModal"
import { useRouter } from "next/router"
import { useEffect } from "react"

const leaderboard = ({ library, state, networks, dispatch, connectWallet }) => {
  const network = library ? library.wallet.network : ""
  const account = library ? library.wallet.address : ""

  const router = useRouter()

  // Redirect user from network other then Polygon
  const isPolygon = (network) => [137, 80001].includes(network)
  useEffect(() => {
    !isPolygon && router.push("/")
  }, [])

  //   if (!groups.includes(group)) {
  //     return null
  //   }

  return (
    <>
      <Leaderboard network={network} library={library} />
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

export default leaderboard
