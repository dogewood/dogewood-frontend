import { useEffect, useState } from 'react'
import Button from 'components/Button/Button'
import Modal from './Modal'
import styles from './Modal.module.css'
import { toFixed } from 'utils/number'

interface ITransaction {
  selectedTokens: any[],
  treatBalance?: string | number,
  show: Boolean,
  onConfirm: Function,
  onCancel: Function,
}

export default function BridgeModal({
  selectedTokens = [],
  treatBalance = 0,
  show,
  onConfirm,
  onCancel,
}: ITransaction) {
  const [treatAmount, setTreatAmount] = useState(0 as string | number)
  useEffect(() => {
    if (show) {
      setTreatAmount(0)
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
      <h1>BRIDGE {selectedTokens?.length > 1 ? `${selectedTokens?.length} DOGES` : `${selectedTokens?.length} DOGE`} AND $TREAT</h1>
      <p>You are about to send {selectedTokens?.length > 1 ? `${selectedTokens?.length} Doges` : `${selectedTokens?.length} Doge`} and {toFixed(treatAmount, 4).toString()} $TREAT</p>
      <div className={styles.bridgeModalInput}>
        <input value={treatAmount} onChange={e => Number(e.target.value) && setTreatAmount(e.target.value) }/>
        <span onClick={() => setTreatAmount(treatBalance)}>Max</span>
      </div>
      <div className={styles.bridgeModalActions}>
        <Button onClick={() => onCancel && onCancel()} className={styles.bridgeModalCancel}>Cancel</Button>
        <Button onClick={() => onConfirm && onConfirm(selectedTokens, treatAmount)} className={styles.bridgeModalConfirm}>Send</Button>
      </div>
    </Modal>
  )
}
