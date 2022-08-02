import Link from "next/link"
import { toast } from "react-toastify"
import classes from "./TrainingPage.module.scss"
const TrainingPage = ({ isPolygon }) => {
  return (
    <div className={classes.training_wrapper}>
      {isPolygon ? (
        <div className={classes.training_container}>
          <Link href="/leaderboard">
            <a>
              <p className={classes.leaderboard}>View Leaderboard</p>
            </a>
          </Link>
          <Link href="/logs">
            <a>
              <p className={classes.leaderboard}>View Battle Log</p>
            </a>
          </Link>
          <div className={classes.training_content_box}>
            <div className={classes.left}>
              <h2>GO ON A QUEST!</h2>
              <h1>TRAINING GROUNDS</h1>
            </div>
            <div className={classes.right}>
              <Link href="/questing/game">
                <a>
                  <button>Start Quest</button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.training_container}>
          <div
            className={`${classes.training_content_box} + ${classes.training_content_notPolygon}`}
          >
            <div className={classes.left}>
              <h2>GO ON A QUEST!</h2>
              <h1>TRAINING GROUNDS</h1>
            </div>
            <div className={classes.right}>
              <button onClick={() => toast.error(`Should be polygon network.`)}>
                Start Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingPage
