import { createContext, useState } from "react"

const DefenderContext = createContext({
  defenders: null,
  setDefenders: null,
  bridgeTXS: null,
  setBridgeTXS: null,
})

export const DefenderContextProvider = ({ children }) => {
  const [defenders, setDefenders] = useState()
  const [bridgeTXS, setBridgeTXS] = useState()
  const context = {
    defenders: defenders,
    setDefenders: setDefenders,
    bridgeTXS,
    setBridgeTXS,
  }
  return (
    <DefenderContext.Provider value={context}>
      {children}
    </DefenderContext.Provider>
  )
}

export default DefenderContext
