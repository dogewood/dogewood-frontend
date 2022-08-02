import Button from "components/Button/Button"
import Link from "next/link"
import router from "next/router"
import classes from "./QuestComplete.module.scss"

const QuestComplete = ({
  showBattleCompleted,
  onClose,
  difficulty,
  score,
  highScore,
  handleStartQuest,
}) => {
  if (!showBattleCompleted) {
    return null
  }
  return (
    <div className={classes.quest_complete_wrapper}>
      <div className={classes.container}>
        <h3>TRAINING GROUNDS</h3>
        <h1>BATTLE COMPLETE!</h1>
        <div className={classes.difficulty}>
          <p className={classes.label}>DIFFICULTY</p>
          <img src={`/bg/${difficulty}.svg`} alt="" />
          <p className={classes.value}>{difficulty}</p>
        </div>
        <div className={classes.score}>
          <h4>YOUR SCORE</h4>
          <h1>{+score || "-"}</h1>
        </div>
        <div className={classes.score}>
          <h4>
            YOUR HIGHEST SCORE: <span>{+highScore || "-"}</span>
          </h4>
        </div>
        {/* <div className={classes.score}>
          <h4>
            CURRENT RANK: <span>#4</span>
          </h4>
        </div> */}
        <div className={classes.buttons}>
          <div className={classes.top_buttons}>
            <Link href="/logs">
              <a>
                <Button onClick={() => onClose()}>View Log</Button>
              </a>
            </Link>
            <Button
              onClick={() => {
                onClose()
                handleStartQuest()
              }}
            >
              Go Again
            </Button>
          </div>

          <Button
            onClick={() => {
              onClose()
              router.push("/")
            }}
          >
            End Quest
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuestComplete
