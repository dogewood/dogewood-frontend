import Link from "next/link"
import { gql, useQuery } from "@apollo/client"
import classes from "./Logs.module.scss"
import { useEffect, useState } from "react"
import moment from "moment"

export const getDifficulty = (index) => {
  return index === 0
    ? "novice"
    : index === 1
    ? "apprentice"
    : index === 2
    ? "journeyman"
    : index === 3
    ? "defender"
    : null
}

const Logs = ({ account, state }) => {
  const [userInfo, setUserInfo] = useState("")
  const [performTimestamp, setPerformTimestamp] = useState()

  useEffect(() => {
    setPerformTimestamp(performData?.leaderboardPerformLogs[0]?.timestamp)
    setUserInfo(account)
  }, [account])

  // const query = gql`
  //   query {
  //     combatLogs(
  //       first: 500
  //       orderBy: timestamp
  //       orderDirection: desc
  //       where: { user: "${userInfo?.toLowerCase()}",
  //        timestamp_gte: ${performTimestamp || 0}
  //       }
  //     ) {
  //       id
  //       combatId
  //       dogeId
  //       user
  //       dogeAttribLog {
  //         id
  //         head
  //         breed
  //         color
  //         class1
  //         armor
  //         offhand
  //         mainhand
  //         level
  //         breedRerollCount
  //         classRerollCount
  //         artStyle
  //       }
  //       dogeHp
  //       enemyHp
  //       dogeHp2
  //       enemyHp2
  //       enemyClass
  //       isWinner
  //       lbPoints
  //       txHash
  //       txIndex
  //       timestamp
  //       blockNumber
  //     }
  //   }
  // `
  const query = gql`
    query {
      questLogs(
        first: 500
        orderBy: timestamp
        orderDirection: desc
        where: { owner: "${userInfo?.toLowerCase()}",
        timestamp_gte: ${performTimestamp || 0}
        }
      ) {
        id
        combatId
        gameType
        performId
        groupIndex
        doge
        owner
        score
        txHash
        txIndex
        timestamp
        blockNumber
      }
    }
  `
  const performQuery = gql`
    query {
      leaderboardPerformLogs(
        first: 1
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        performId
        actionId
        txHash
        txIndex
        timestamp
        blockNumber
      }
    }
  `
  const { data: performData } = useQuery(performQuery)

  const { data: logs } = useQuery(query)
  return (
    <div className={classes.logs_wrapper}>
      <div className={classes.container}>
        <h1>QUEST</h1>
        <div className={classes.table}>
          <table className={classes.leaderboard_table}>
            <thead>
              <tr>
                <td className={classes.col_one}>S.N</td>
                <td className={classes.col_two}>TIMESTAMP</td>
                <td className={classes.col_three}>SCENARIO</td>
                <td className={classes.col_four}>DIFFICULTY</td>
                <td className={classes.col_five}>DOGE(S) SENT</td>
                <td className={classes.col_six}>SCORE</td>
                <td className={classes.col_seven}>Details</td>
              </tr>
            </thead>
            <tbody>
              {logs?.questLogs?.map((log, index) => {
                return (
                  <tr key={log.txHash}>
                    <td>{index + 1}</td>
                    <td>{moment.unix(log.timestamp).format("lll")}</td>
                    <td>Training Grounds</td>
                    <td className={classes.difficulty}>
                      <img
                        src={`/icons/${getDifficulty(log.groupIndex)}.svg`}
                        alt=""
                      />
                      <span>{getDifficulty(log.groupIndex)}</span>
                    </td>
                    <td className={classes.doge_sent}>
                      {/* <img src="/bg/character_3.png" alt="" /> */}
                      {log.doge}
                    </td>
                    <td>{log.score}</td>
                    <td className={classes.details}>
                      <Link href={`/logs/${log.combatId}`}>
                        <a>Details</a>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Logs
