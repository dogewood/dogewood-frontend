import { useEffect, useState } from 'react'
import Button from 'components/Button/Button'
import Modal from './Modal'
import styles from './Modal.module.css'
import Web3 from "web3"
import { toFixed } from 'utils/number'
import {
  getMultipleLevelUpPrice,
} from "utils/constants"

interface ILevel {
  curLevel?: string | number,
  show: Boolean,
  onConfirm: Function,
  onCancel: Function,
}

export default function LevelUpModal({
  curLevel = 1,
  show,
  onConfirm,
  onCancel,
}: ILevel) {
  const [toLevel, setToLevel] = useState(0 as string | number)
  useEffect(() => {
    if (show) {
      setToLevel(Number(curLevel) + 1)
    }
  }, [show])
  return (
    <Modal
      show={!!show}
      onRequestClose={onCancel}
      closeOnEscape={false}
      loading={false}
      wrapperClassName={styles.bridgeModal}
      bodyClassName={styles.bridgeModalBody}
      contentClassName={styles.bridgeModalContent}
    >
      <h1>Level Up Your Doge</h1>
      <p>Current level is {curLevel}. Please input new level to upgrade.</p>
      <p>It costs {toFixed(Web3.utils.fromWei(getMultipleLevelUpPrice(Number(curLevel), Number(toLevel))), 0) || "-"} $TREAT.</p>
      <div className={styles.bridgeModalInput}>
        <input value={toLevel} onChange={e => Number(e.target.value) && setToLevel(e.target.value) }/>
        <span onClick={() => setToLevel(20)}>Max</span>
      </div>
      <div className={styles.bridgeModalActions}>
        <Button onClick={() => onCancel && onCancel()} className={styles.bridgeModalCancel}>Cancel</Button>
        <Button onClick={() => onConfirm && onConfirm(toLevel)} className={styles.bridgeModalConfirm}>Continue</Button>
      </div>
    </Modal>
  )
}
