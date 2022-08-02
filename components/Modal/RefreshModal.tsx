import Modal from "./Modal"
import styles from "./Modal.module.css"
import Button from "components/Button/Button"

const RefreshModal = ({ show, onConfirm, onClose, entryFee }) => {
  return (
    <Modal
      show={!!show}
      onRequestClose={() => onClose()}
      wrapperClassName={styles.refresh_modal}
    >
      <div className={styles.refresh_modal_content}>
        <h1>REFRESH DOGE</h1>
        <div className={styles.info}>
          <p>
            The doge you&apos;re about to send to quest is tired from questing.
          </p>
          <p>You can spend treat to refresh them to quest again!</p>
        </div>

        <div className={styles.buttons}>
          <Button className="back-btn" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button className="main-btn" onClick={() => onConfirm && onConfirm()}>Quest Anyway ({entryFee} Treat )</Button>
        </div>
      </div>
    </Modal>
  )
}

export default RefreshModal
