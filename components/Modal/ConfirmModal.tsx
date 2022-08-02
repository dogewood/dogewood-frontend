import Button from "components/Button/Button"
import Modal from "./Modal"
import styles from "./Modal.module.css"

interface ITransaction {
  show: Boolean
  onConfirm: Function
  onCancel: Function
  title: String
}

export default function ConfirmModal({
  show,
  onConfirm,
  onCancel,
  title,
}: ITransaction) {
  return (
    <Modal
      show={!!show}
      onRequestClose={onCancel}
      closeOnEscape={false}
      loading={false}
    >
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <Button
          onClick={() => onCancel && onCancel()}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm && onConfirm()}
          className={styles.confirmButton}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
