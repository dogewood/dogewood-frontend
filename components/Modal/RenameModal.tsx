import { useEffect, useState } from 'react'
import Button from 'components/Button/Button'
import Modal from './Modal'
import styles from './Modal.module.css'
import { toFixed } from 'utils/number'

interface IName {
  curName?: string,
  show: Boolean,
  onConfirm: Function,
  onCancel: Function,
}

export default function RenameModal({
  curName = "",
  show,
  onConfirm,
  onCancel,
}: IName) {
  const [newName, setNewName] = useState("" as string)
  useEffect(() => {
    if (show) {
      setNewName(curName)
    }
  }, [show])

  const handleChange = (e) => {
    let newVal = e.target.value.trim();
    if(
      curName != newVal
      && newVal.length <= 25
    ) {
      setNewName(e.target.value);
    }
  }

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
      <h1>RENAME DOGE</h1>
      <p>Renaming this doge will cost 3 $TREAT</p>
      <div className={styles.renameModalInput}>
        <input value={newName} onChange={handleChange} placeholder="Enter New Name"/>
      </div>
      <div className={styles.bridgeModalActions}>
        <Button onClick={() => onCancel && onCancel()} className={styles.bridgeModalCancel}>Cancel</Button>
        <Button onClick={() => onConfirm && onConfirm(newName.trim())} className={styles.bridgeModalConfirm}>Rename (3 $TREAT)</Button>
      </div>
    </Modal>
  )
}
