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
  treatBalance: number
  totalSupply: number
  // unclaimedAmount?: number
  // dogeBalance?: number
  // nftInfo: any
  claimInfo: any
  disabled: boolean
  onSubmit: Function
}

const defaults = {
  claimableAmount: 0,
}

export default function ClaimForm({
  account,
  network,
  treatBalance,
  // nftInfo,
  disabled,
  onSubmit,
  totalSupply,
  claimInfo,
}: IBuyForm) {
  const [nftAmount, setNftAmount] = useState(1)
  const currentNetwork = process.env.APP_ENV === "dev" ? 5 : 1
  const saleLeft = 10000 - totalSupply
  const unclaimedAmount = claimInfo?.filter(o => o.claimed == false).length
  const dogeBalance = claimInfo?.length
  const claimableAmount = Math.min(saleLeft, unclaimedAmount) || 0
  // const totalTreat = new BigNumber(claimableAmount * 40).dp(0, 1).toString(10)

  // let disabled_ = disabled || !account || !claimInfo ||
  // (new BigNumber(totalTreat)).gt(new BigNumber(treatBalance)) ||
  //   network !== currentNetwork ||
  //   claimableAmount <= 0

  const handleSubmit = (e) => {
    e.preventDefault()
    // window.open("https://opensea.io/collection/defenders-of-dogewood", "_blank")
    // if ((+nftInfo.totalSupply || 0) >= sellCount) {
    //   window.open('https://opensea.io/collection/defenders-of-dogewood', '_blank')
    // } else {
      onSubmit({ dogeIds: claimInfo?.filter(o => o.claimed == false).map(o => o.dogeId).slice(0, nftAmount) })
    // }
  }

  return (
    <div className={styles.buyForm}>
      <form className={styles.form}>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>TREAT BALANCE</div>
          <div className={styles.ethBalance}>
            {new BigNumber(treatBalance).dp(4, 1).toString(10)} TREAT
          </div>
        </div>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>DOGE BALANCE</div>
          <div className={styles.ethBalance}>
            {dogeBalance || 0} Doges
          </div>
        </div>
        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>CLAIMABLE AMOUNT</div>
          <div className={styles.ethBalance}>
            {unclaimedAmount || 0} Commoners
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
                nftAmount + 1 > claimableAmount ? styles.disabled : ""
              }`}
              onClick={() => {
                if (nftAmount + 1 <= claimableAmount) {
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
              if(claimableAmount > 0) setNftAmount(claimableAmount)
            }}
          >
            MAX
          </div>
        </div>

        <div className={`flex-center justify-between ${styles.formWrapper}`}>
          <div className={styles.label}>TOTAL TREAT</div>
          <div className={styles.ethBalance}>
            {new BigNumber(nftAmount * 40).dp(0, 1).toString(10)} TREAT
          </div>
        </div>
        <div className="flex">
          <Button
            className="flex-center justify-center"
            disabled={disabled || !account || !claimInfo ||
              (new BigNumber(nftAmount * 40)).gt(new BigNumber(treatBalance)) ||
                network !== currentNetwork ||
                claimableAmount <= 0}
            onClick={handleSubmit}
          >
            {`Claim Mint`}
          </Button>
        </div>
      </form>
    </div>
  )
}
