import LogDetail from "components/Logs/LogDetail"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

const Log = ({ library }) => {
  // Redirect user from network other then Polygon

  const router = useRouter()
  const isPolygon = (network) => [137, 80001].includes(network)
  useEffect(() => {
    !isPolygon && router.push("/")
  }, [])
  return (
    <div>
      <LogDetail library={library} />
    </div>
  )
}

export default Log
