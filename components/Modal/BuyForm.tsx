import Web3 from "web3"
import { useState } from "react"
import BigNumber from "bignumber.js"
// import ProgressBar from '@ramonak/react-progress-bar'
import { Progress } from "react-sweet-progress"
import "react-sweet-progress/lib/style.css"
import Button from "components/Button/Button"
import TxLoader from "components/TxLoader/TxLoader"
import styles from "./Modal.module.css"
import { toFixed } from "utils/number"

interface IBuyForm {
  account: string
  network: number
  balance: number
  totalSupply: number
  // nftInfo: any
  userInfo: any
  disabled: boolean
  onSubmit: Function
  useTreat: boolean
}

const defaults = {
  nftAmount: 1,
}

export default function BuyForm({
  account,
  network,
  userInfo,
  // balance,
  // nftInfo,
  disabled,
  onSubmit,
  totalSupply,
  useTreat,
}: IBuyForm) {
  const [nftAmount, setNftAmount] = useState(1)
  const nftPrice = useTreat ? new BigNumber(150).times(10 ** 18) : new BigNumber(0.035).times(10 ** 18)
  const currentNetwork = process.env.APP_ENV === "dev" ? 80001 : 137
  const saleLeft = 10000 - totalSupply

  let maxCount = Math.min(6, saleLeft)
  let balance_ = useTreat ? 
    (userInfo?.treatBalance ? `${toFixed(Web3.utils.fromWei(userInfo.treatBalance), 4)} TREAT` : "- TREAT") :
    (userInfo?.wethBalance ? `${toFixed(Web3.utils.fromWei(userInfo.wethBalance), 4)} WETH` : "- WETH")
  let disabled_ = useTreat ?
    (
      disabled || !account ||
      new BigNumber(userInfo.treatBalance).isZero() ||
      network !== currentNetwork ||
      nftPrice.times(nftAmount).gt(new BigNumber(userInfo.treatBalance)) ||
      nftAmount <= 0 || maxCount <= 0
    ) : (
      disabled || !account ||
      new BigNumber(userInfo.wethBalance).isZero() ||
      network !== currentNetwork ||
      nftPrice.times(nftAmount).gt(new BigNumber(userInfo.wethBalance)) ||
      nftAmount <= 0 || maxCount <= 0
    )

  const handleSubmit = (e) => {
    e.preventDefault()
    // window.open("https://opensea.io/collection/defenders-of-dogewood", "_blank")
    // if ((+nftInfo.totalSupply || 0) >= sellCount) {
    //   window.open('https://opensea.io/collection/defenders-of-dogewood', '_blank')
    // } else {
      onSubmit({ cost: nftPrice.times(nftAmount).toString(10), amount: nftAmount })
    // }
  }

  return (
    <div className={styles.buyForm}>
      <form className={styles.form}>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>{useTreat ? "TREAT BALANCE" : "WETH BALANCE"}</div>
          <div className={styles.ethBalance}>
            {/* {userInfo?.wethBalance ? toFixed(Web3.utils.fromWei(userInfo.wethBalance), 4) : "-"} WETH */}
            {balance_}
          </div>
        </div>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>AMOUNT</div>
          <div className={`flex-center ${styles.counter}`}>
            <div
              className={`cursor ${styles.minus} ${
                nftAmount - 1 < 1 ? styles.disabled : ""
              }`}
              onClick={() => {
                if (nftAmount - 1 >= 1) {
                  setNftAmount(nftAmount - 1)
                }
              }}
            >
              –
            </div>
            <div className={styles.amount}>{nftAmount}</div>
            <div
              className={`cursor ${styles.plus} ${
                nftAmount + 1 > maxCount ? styles.disabled : ""
              }`}
              onClick={() => {
                if (nftAmount + 1 <= maxCount) {
                  setNftAmount(nftAmount + 1)
                }
              }}
            >
              +
            </div>
          </div>
          <div
            className={styles.maxBtn}
            onClick={() => {
              if(maxCount > 0) setNftAmount(maxCount)
            }}
          >
            MAX
          </div>
        </div>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>TOTAL BALANCE</div>
          <div className={styles.ethBalance}>
            {toFixed(Web3.utils.fromWei(nftPrice.times(nftAmount).toString(10)), 4)} 
            {useTreat ? " TREAT" : " WETH"}
          </div>
        </div>
        <div className="flex">
          <Button
            className="flex-center justify-center"
            disabled={disabled_}
            onClick={handleSubmit}
          >
            {/* {+(nftInfo.totalSupply || 0) >= sellCount
              ? 'Check us out on opensea'
              : 'BUY NOW'} */}
            Mint
          </Button>
        </div>
      </form>
    </div>
  )
}
