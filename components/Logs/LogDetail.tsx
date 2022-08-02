import classes from "./Logs.module.scss"
import { gql, useQuery } from "@apollo/client"
import { useRouter } from "next/router"
import { getDifficulty } from "./Logs"
import {
  breedNames,
  classNames,
  attackTypes,
  classStats,
} from "utils/constants"
import { useContext, useEffect, useState } from "react"
import Defender_round from "components/Training/Defender_round"
import { toast } from "react-toastify"

const LogDetail = ({ library }) => {
  const router = useRouter()

  const query = gql`
    query {
      questLogs(first: 1, where: { combatId: ${router?.query?.log} }) {
        id
        combatId
        gameType
        performId
        groupIndex
        doge
        owner
        score
      }

      combatLog(id: ${router?.query?.log}) {
        id
        combatId
        dogeId
        user
        dogeAttribLog {
          id
          head
          breed
          color
          class1
          armor
          offhand
          mainhand
          level
          breedRerollCount
          classRerollCount
          artStyle
        }
        dogeHp
        enemyHp
        dogeHp2
        enemyHp2
        enemyClass
        isWinner
        lbPoints
        txHash
        txIndex
        timestamp
        blockNumber
      }
      
      combatTurnLogs(first: 1000, 
        orderBy: turnId,
        orderDirection: asc,
        where: { combatId: ${router?.query?.log} }
      ) {
        id
        combatId
        turnId
        playerTypes
        rollDamageDodge {
          id
          attackerType
          baseDamage
          isCriticalDamage
          rollDodge
          defenderHp
        }
        txHash
        txIndex
        timestamp
        blockNumber
      }
    }
  `
  const [currentDefender, setCurrentDefender] = useState({} as any)
  const { data } = useQuery(query)

  const account = library ? library.wallet.address : ""
  const network = library ? library.wallet.network : ""

  const getPlayerName = (playerType) => {
    if (playerType == 0) return `Doge #${data?.combatLog?.dogeId}`
    else
      return `${
        attackTypes[
          classStats[data?.combatLog?.enemyClass || 0].attackType
        ]
      } Dummy (${classStats[data?.combatLog?.enemyClass || 0].name})`
  }
  const dogeTitle = `${
    breedNames[data?.combatLog?.dogeAttribLog?.breed || 0]
  } ${classNames[data?.combatLog?.dogeAttribLog?.class1 || 0]}`

  // const currentToken = getCurrentDoge()
  const isPolygon = (network) => [137, 80001].includes(network)
  const getTokenById = (tokenId: number) => {
    if (library?.methods?.Dogewood) {
      const {
        tokenURI,
        claimable,
        rerollCountHistory,
        /* upgradeLevelPrice, */ mintLogs,
        activities,
        ownerOf,
      } = library?.methods?.Dogewood
      const { tokenNameByIndex } = library?.methods?.NameChange

      return Promise.all([
        ownerOf(tokenId),
        tokenURI(tokenId),
        claimable(tokenId),
        rerollCountHistory(0, tokenId),
        rerollCountHistory(1, tokenId),
        mintLogs(tokenId),
        activities(tokenId),
        isPolygon(network) ? tokenNameByIndex(tokenId) : "",
      ]).then(
        ([
          ownerOf,
          tokenURI,
          claimable,
          rerollBreedCount,
          rerollClassCount,
          mintLogs,
          activities,
          name,
        ]) => ({
          tokenId,
          ownerOf,
          tokenURI: JSON.parse(atob(tokenURI?.split(",")?.[1] || "")),
          claimable,
          rerollBreedCount,
          rerollClassCount,
          // rerollBreedPrice: getRerollPrice(Number(rerollBreedCount)),
          // rerollClassPrice: getRerollPrice(Number(rerollClassCount)),
          mintLogs,
          activities,
          name,
        })
      )
    }
    return Promise.resolve()
  }

  useEffect(() => {
    getCurrentDoge(Number(data?.combatLog?.dogeId))
  }, [network, data?.combatLog?.dogeId])

  const getCurrentDoge = (dogeIndex) => {
    if (dogeIndex) {
      getTokenById(dogeIndex)
        .then((defender_) => {
          setCurrentDefender(defender_)
        })
        .catch((err) => console.log)
    }
  }

  // TODO:

  return (
    <div className={classes.log_detail_wrapper}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.left}>
            <h3>QUEST DETAILS</h3>
            <h1>QUEST !</h1>
            <div className={classes.difficulty}>
              <p className={classes.label}>DIFFICULTY:</p>
              <img
                src={`/icons/${getDifficulty(
                  data?.questLogs[0]?.groupIndex || 0
                )}.svg`}
                alt=""
              />
              <p className={classes.value}>
                {getDifficulty(data?.questLogs[0].groupIndex || 0)}
              </p>
            </div>
          </div>
          <div className={classes.right}>
            <p>SCORE</p>
            <h2>{`${data?.questLogs[0]?.score || 0}`}</h2>
          </div>
        </div>

        <div className={classes.battle_log_section}>
          <div className={classes.log_header}>
            <p>DOGES SENT</p>
            <div className={classes.doge}>
              <div className={classes.log_detail_doge}>
                <Defender_round
                  token={currentDefender}
                  handleDefenderSelect={() => null}
                  selected={false}
                  tired={false}
                />
              </div>
              <div className={classes.name}>
                <p>{getPlayerName(0)}</p>
                <span>{dogeTitle}</span>
              </div>
            </div>
          </div>
          <div className={classes.logs_section}>
            <h3>BATTLE LOG</h3>
            <p>
              {getPlayerName(0)} encounters 1 {getPlayerName(1)}!
            </p>
            {data?.combatTurnLogs?.length &&
              data?.combatTurnLogs?.map((turnLog, index_) => {
                return (
                  <div className={classes.turn} key={index_}>
                    <span>TURN {`${index_ + 1}`}</span>
                    <div>
                      {turnLog.rollDamageDodge.map((rollDodge, orderIndex) => {
                        return (
                          <div key={orderIndex}>
                            <p>
                              {getPlayerName(turnLog.playerTypes[orderIndex])}{" "}
                              attacks{" "}
                              {getPlayerName(
                                1 - turnLog.playerTypes[orderIndex]
                              )}
                            </p>
                            <p>
                              {getPlayerName(turnLog.playerTypes[orderIndex])}{" "}
                              deals {rollDodge.baseDamage} damage to{" "}
                              {getPlayerName(
                                1 - turnLog.playerTypes[orderIndex]
                              )}
                            </p>
                            <p>
                              Damage is{" "}
                              {rollDodge.isCriticalDamage
                                ? "critical"
                                : "not critical"}
                              !
                            </p>
                            {rollDodge.rollDodge ? (
                              <p>
                                {getPlayerName(turnLog.playerTypes[orderIndex])}
                                's attack misses{" "}
                                {getPlayerName(
                                  1 - turnLog.playerTypes[orderIndex]
                                )}
                                !
                              </p>
                            ) : (
                              <p>
                                {getPlayerName(
                                  1 - turnLog.playerTypes[orderIndex]
                                )}{" "}
                                receives{" "}
                                {getPlayerName(turnLog.playerTypes[orderIndex])}
                                's attack damage!
                              </p>
                            )}
                            <br />
                            {rollDodge.defenderHp == 0 && (
                              <p>
                                {getPlayerName(
                                  1 - turnLog.playerTypes[orderIndex]
                                )}{" "}
                                is destroyed!
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            {/* <div className={classes.turn}>
              <span>TURN 2</span>
              <div>
                <p>Puggins attacks Melee Dummy 2</p>
                <p>Puggins deals 10 damage to Melee Dummy 2</p>
                <br />
                <p>Melee Dummy 2 is destroyed!</p>
                <br />
                <p>Ranged Dummy fires an arrow at Puggins!</p>
                <p>Ranged Dummy’s attack misses Puggins!</p>
                <br />
                <p>Melee Dummy strikes Puggins with an awkward blow!</p>
                <p>Puggins takes 1 Melee Damage</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogDetail
