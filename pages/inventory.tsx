import Inventory from "components/Inventory"
import { useRouter } from "next/router"
import { useEffect } from "react"

const InventoryPage = ({ library }) => {
  const router = useRouter()
  const network = library ? library.wallet.network : ""
  useEffect(() => {
    const isPolygon = (network) => [137, 80001].includes(network)
    if (!isPolygon(network)) {
      router.push("/")
    }
  }, [network])
  return <Inventory library={library} />
}

export default InventoryPage
