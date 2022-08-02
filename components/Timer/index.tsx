import React from "react"
import Countdown from "react-countdown"

const Timer = () => {
  const today = new Date()
  today.setUTCHours(23, 59, 59, 999)
  const countDownDate = today.getTime()

  return <Countdown date={countDownDate} />
}

export default React.memo(Timer)
