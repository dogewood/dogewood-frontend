import classes from "./Leaderboard.module.scss"
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

const Leaderboard = ({ network, library }) => {
  const [selectedDate, setSelectedDate] = useState<any>("")
  const [currentGroup, setCurrentGroup] = useState(0)
  const [convertedDate, setConvertedDate] = useState<any>("")
  const [latestTime, setLatestTime] = useState("")
  const [performId, setPerformId] = useState("")
  const [prize, setPrize] = useState("")

  const performQuery = gql`
    query {
      leaderboardPerformLogs(
        first: 1
        orderBy: timestamp
        orderDirection: desc
        where: {
          timestamp_gte:${convertedDate || 0}
          timestamp_lte:${(Number(convertedDate)+86400) || 0}
        }
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
      where: { groupIndex: ${currentGroup}, performId: ${performId || -1} }
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
  }, [])
  useEffect(() => {
    setPerformId(performData?.leaderboardPerformLogs[0]?.performId || 0)
  }, [performLoading, performData])
  useEffect(() => {
    if (library?.methods?.Quest) {
      const { prizePool } = library?.methods?.Quest
      prizePool(currentGroup)
        .then((o) => {
          setPrize(new BigNumber(o).multipliedBy(0.4).toString())
        })
        .catch((e) => console.log)
    }
  }, [network, library, currentGroup])
  // console.log(
  //   prizeData,
  //   "prize Data",
  //   prizeData?.leaderboardPerformLogs &&
  //     moment.unix(prizeData?.leaderboardPerformLogs[0]?.timestamp).format("lll")
  // )

  const handleDateSelect = (date) => {
    const select = new Date(`${date}`)
    // select.setUTCHours(0, 0, 0, 0)
    // const formatted = moment(select).format("YYYY MM DD, h:mm:ss a")
    const unixTime = Math.round(select.getTime() / 1000 + select.getTimezoneOffset() * 60)
    setConvertedDate(unixTime-86400)
  }

  const getCurrentDay = () => {
    const select = new Date()
    const formatted_to_show = moment(select).format("YYYY-MM-DD")
    setSelectedDate(formatted_to_show)
    select.setUTCHours(0, 0, 0, 0)
    // const formatted = moment(select).format("YYYY MM DD, h:mm:ss a")
    const unixTime = Math.round(select.getTime() / 1000)
    setConvertedDate(unixTime)
  }
  return (
    <div className={classes.leaderboard_wrapper}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.title}>
            <h2>LEADERBOARD</h2>
            <h1>
              Training Grounds <IoIosTimer className={classes.icon} />
              <Timer />
            </h1>
            <div className={classes.calendar}>
              <input
                type="date"
                value={selectedDate}
                onKeyDown={(e) => {
                  e.preventDefault()
                }}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  handleDateSelect(e.target.value)
                }}
              />
            </div>
          </div>
          <div className={classes.prize}>
            <div className={classes.prize_left}>
              <p>Prize Pool</p>
              <div className={classes.prize_count}>
                <img src="/bg/bone.png" alt="" />
                <h2>{prize ? toFixed(Web3.utils.fromWei(prize), 4) : "-"}</h2>
              </div>
            </div>
            <div className={classes.prize_right}>
              <p>Prize Pool</p>
              <div className={classes.prize_count}>
                <img src="/eth_icon.png" alt="" />
                <h2>
                  {currentGroup === 0
                    ? 0.03
                    : currentGroup === 1
                    ? 0.05
                    : currentGroup === 2
                    ? 0.06
                    : currentGroup === 3
                    ? 0.08
                    : 0}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.table_sidenav_container}>
          <div className={classes.sidenav}>
            <ul>
              {/* <Link href="/leaderboard/novice">
                <a> */}{" "}
              <li
                className={currentGroup === 0 ? classes.active : ""}
                onClick={() => setCurrentGroup(0)}
              >
                {" "}
                <div>
                  <img
                    src="/icons/novice.svg"
                    alt=""
                    className={classes.nav_img_one}
                  />
                </div>{" "}
                <p>Novice</p>
              </li>
              {/* </a>
              </Link> */}
              {/* <Link href="/leaderboard/apprentice">
                <a> */}
              <li
                className={currentGroup === 1 ? classes.active : ""}
                onClick={() => setCurrentGroup(1)}
              >
                <div>
                  <img
                    src="/icons/apprentice.svg"
                    alt=""
                    className={classes.nav_img_two}
                  />
                </div>{" "}
                <p>Apprentice</p>
              </li>
              {/* </a>
              </Link> */}
              {/* <Link href="/leaderboard/journeyman">
                <a> */}
              <li
                className={currentGroup === 2 ? classes.active : ""}
                onClick={() => setCurrentGroup(2)}
              >
                <div>
                  <img
                    src="/icons/journeyman.svg"
                    alt=""
                    className={classes.nav_img_three}
                  />
                </div>{" "}
                <p>Journeyman</p>
              </li>
              {/* </a>
              </Link> */}
              {/* <Link href="/leaderboard/defender">
                <a> */}
              <li
                className={currentGroup === 3 ? classes.active : ""}
                onClick={() => setCurrentGroup(3)}
              >
                <div>
                  <img
                    src="/icons/defender.svg"
                    alt=""
                    className={classes.nav_img_four}
                  />
                </div>{" "}
                <p>Defender</p>
              </li>
              {/* </a>
              </Link> */}
            </ul>
          </div>
          <div className={classes.table}>
            {loading ? (
              <h1 className={classes.loading}>Loading...</h1>
            ) : (
              <table className={classes.leaderboard_table}>
                <thead>
                  <tr>
                    <td className={classes.col_one}>Place</td>
                    <td className={classes.col_two}>Wallet</td>
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
                        <td>{log.doge}</td>
                        <td>{log.score}</td>
                        <td className={classes.details}>
                          <Link href={`/logs/${log.combatId}`}>
                            <a>Battle Logs</a>
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

export default Leaderboard
