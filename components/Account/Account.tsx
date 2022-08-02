import React, { useState } from 'react'
import { TMap } from 'types'
import styles from './Account.module.css'

interface IAccount {
  loading: boolean
  account: TMap
  balance: string
  dispatch: Function
  connectWallet: Function
}

export default function Account({
  loading = false,
  account,
  balance,
  connectWallet,
}: IAccount) {
  const [isClicked, setIsClicked] = useState(false)

  return (
    <div
      className={styles.account}
      onClick={() => {
        setIsClicked(true)
        if(!window.ethereum) {
          alert('Please install Metamask. https://metamask.io/download')
        } else {
          connectWallet(true)
        }
      }}
    >
      {!account.address ? (
        <div className="cursor center">
          Connect
        </div>
      ) : (
        <div className={styles.info}>
          <div className="flex-center center cursor">
            {`${account.address.substr(0, 6)}...${account.address.substr(
              -4,
              4
            )}`}
          </div>
        </div>
      )}
    </div>
  )
}
