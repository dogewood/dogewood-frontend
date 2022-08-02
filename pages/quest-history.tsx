import QuestHistory from "components/QuestHistory/QuestHistory"
import { useRouter } from "next/router"

const history = ({ library, state, networks, dispatch, connectWallet }) => {
  const network = library ? library.wallet.network : ""
  const account = library ? library.wallet.address : ""
  const router = useRouter()
  const group = router?.query?.group
  return (
    <>
      <QuestHistory
        group={group}
        network={network}
        library={library}
        account={library?.wallet?.address}
      />
    </>
  )
}

export default history
