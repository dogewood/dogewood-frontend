import React, { useState } from 'react'
import moment from 'moment'
import Countdown from 'react-countdown'

import styles from './CountTimeDown.module.css'

export default function CountTimeDown({ onLive }) {
  const [isLive, setIsLive] = useState(false)

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      setIsLive(true)
      onLive()
      return <></>
      // Render a completed state
    }
    // Render a countdown
    return (
      <div className={`flex-center justify-between ${styles.boxWraper}`}>
        <div className={`flex-all ${styles.box}`}>
          <span>DAYS</span>
          <div>{days}</div>
        </div>
        <div className={`flex-all ${styles.box}`}>
          <span>HRS</span>
          <div>{hours}</div>
        </div>
        <div className={`flex-all ${styles.box}`}>
          <span>MIN</span>
          <div>{minutes}</div>
        </div>
        <div className={`flex-all ${styles.box}`}>
          <span>SEC</span>
          <div>{seconds}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-all ${styles.countDownWrapper}`}>
      <div className="flex-center">
        <span className={styles.mintDay}>Mint Day</span>
        {!isLive && (
          <Countdown
            date={moment.utc('2021-09-14 23:00').unix() * 1000}
            renderer={renderer}
          />
        )}
      </div>
    </div>
  )
}
