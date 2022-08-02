import Logs from "components/Logs/Logs"
import { useRouter } from "next/router"
import { useEffect } from "react"

const logs = ({ library, state }) => {
  // Redirect user from network other then Polygon
  const router = useRouter()
  const isPolygon = (network) => [137, 80001].includes(network)
  useEffect(() => {
    !isPolygon && router.push("/")
  }, [])
  return (
    <div>
      <Logs account={library?.wallet?.address} state={state} />
    </div>
  )
}

export default logs
