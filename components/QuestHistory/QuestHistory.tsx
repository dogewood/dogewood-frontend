import classes from "./QuestHistory.module.scss"
import { gql, useQuery } from "@apollo/client"
import { loadavg } from "os"
import moment from "moment"
import Web3 from "web3"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { IoIosTimer } from "react-icons/io"
import { toFixed } from "utils/number"
import BigNumber from "bignumber.js"
import Timer from "components/Timer"
import ens from "utils/ens.json"

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

const QuestHistory = ({ group, network, library, account }) => {
  const [selectedDate, setSelectedDate] = useState<any>("")
  const [convertedDate, setConvertedDate] = useState<any>("")
  const [latestTime, setLatestTime] = useState("")
  const [performId, setPerformId] = useState("")
  const [owner, setOwner] = useState("")
  const [prize, setPrize] = useState("")
  const getIndex = () => {
    return group === "novice"
      ? 0
      : group === "apprentice"
      ? 1
      : group === "journeyman"
      ? 2
      : group === "defender"
      ? 3
      : 0
  }

  const performQuery = gql`
  query {
    leaderboardPerformLogs(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { timestamp_lte: ${convertedDate || null} }
      #where: { timestamp_lte: 1650153600000}
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
  const query = gql`
  query {
    questLogs(
      first: 500
      orderBy: score
      orderDirection: desc
      where: {  
        performId: ${performId || -1} 
        owner: "${owner?.toLowerCase()}" 
      }
    ) {
      id
      combatId
      gameType
      performId
      groupIndex
      owner
      doge
      score
      txHash
      txIndex
      timestamp
      blockNumber
    }
  }
`

  const { loading, data } = useQuery(query)
  const { loading: performLoading, data: performData } = useQuery(performQuery)
  useEffect(() => {
    setLatestTime(
      performData?.leaderboardPerformLogs &&
        moment
          .unix(performData?.leaderboardPerformLogs[0]?.timestamp)
          .format("lll")
    )
    getCurrentDay()
    setOwner(account)
  }, [])
  useEffect(() => {
    setPerformId(performData?.leaderboardPerformLogs[0]?.performId || 0)
  }, [performLoading])
  useEffect(() => {
    if (library?.methods?.Quest) {
      const { prizePool } = library?.methods?.Quest
      prizePool(getIndex())
        .then((o) => {
          setPrize(new BigNumber(o).multipliedBy(0.4).toString())
        })
        .catch((e) => console.log)
    }
  }, [network, library, group])
  // console.log(
  //   prizeData,
  //   "prize Data",
  //   prizeData?.leaderboardPerformLogs &&
  //     moment.unix(prizeData?.leaderboardPerformLogs[0]?.timestamp).format("lll")
  // )

  // console.log(unixTime, "selectedDate")

  const handleDateSelect = (date) => {
    const select = new Date(`${date}`)
    select.setUTCHours(0, 0, 0, 0)
    const formatted = moment(select).format("YYYY MM DD, h:mm:ss a")
    const unixTime = Math.round(new Date(formatted).getTime() / 1000)
    setSelectedDate(date)
    setConvertedDate(unixTime)
  }

  const getCurrentDay = () => {
    const select = new Date()
    select.setUTCHours(0, 0, 0, 0)
    const formatted = moment(select).format("YYYY MM DD, h:mm:ss a")
    const formatted_to_show = moment(select).format("YYYY-MM-DD")
    const unixTime = Math.round(new Date(formatted).getTime() / 1000)
    setSelectedDate(formatted_to_show)
    setConvertedDate(unixTime)
  }

  return (
    <div className={classes.leaderboard_wrapper}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.title}>
            <h1>Quest History</h1>
          </div>
          <div className={classes.calendar}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
            />
          </div>
        </div>
        <div className={classes.table_sidenav_container}>
          <div className={classes.table}>
            {loading ? (
              <h1 className={classes.loading}>Loading...</h1>
            ) : (
              <table className={classes.leaderboard_table}>
                <thead>
                  <tr>
                    <td className={classes.col_one}>Place</td>
                    <td className={classes.col_two}>Wallet</td>
                    <td className={classes.col_three}>Difficulty</td>
                    <td className={classes.col_three}>Doge</td>
                    <td className={classes.col_three}>Score</td>
                    <td className={classes.col_four}>Battle Logs</td>
                  </tr>
                </thead>
                <tbody>
                  {data?.questLogs?.map((log, index) => {
                    return (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
                        <td>{ens[log.owner.toLowerCase()] || log.owner}</td>
                        <td>
                          <img
                            src={`/icons/${getDifficulty(
                              log?.groupIndex || 0
                            )}.svg`}
                            alt=""
                            className={`img-${log?.groupIndex}`}
                          />
                        </td>
                        <td>{log.doge}</td>
                        <td>{log.score}</td>
                        <td className={classes.details}>
                          <Link href={`/logs/${log.combatId}`}>
                            <a>Log</a>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestHistory
