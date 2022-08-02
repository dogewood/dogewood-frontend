import { BiSearchAlt2 } from "react-icons/bi"
import { useContext, useEffect, useState } from "react"
import DefenderContext from "store/store"
import Defender from "components/Barracks/Defender"
import { toast } from "react-toastify"
import { fetchAverageGas } from "utils/common"
import { getDogesByOwner, getStats } from "utils/dogewood_subgraph"
import { getChildCounter, getEthBridgeLogs, getPolyBridgeLogs } from "utils/api"
import {
  addresses,
  getRerollPrice,
  getLevelUpPrice,
  getRecruitPrice,
  networks,
  supportedNetworks,
  getMultipleLevelUpPrice,
  getRenamePrice,
} from "utils/constants"
import BigNumber from "bignumber.js"
import Web3 from "web3"
import { shorten } from "utils/string"
import { toFixed } from "utils/number"
import styles from "./TrainingPage.module.scss"
import Defender_round from "./Defender_round"
import { MdClose } from "react-icons/md"
import { AiOutlinePlus } from "react-icons/ai"
import DefenderOnField from "./DefenderOnField"
import Button from "components/Button/Button"
import TxModal from "components/Modal/TxModal"
import QuestComplete from "components/QuestComplete/QuestComplete"
import { setFlagsFromString } from "v8"
import RefreshModal from "components/Modal/RefreshModal"
import { getDifficulty, getGroupIndex } from "utils/quest"

const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

const Game = ({
  library,
  network,
  state,
  dispatch,
  account,
  balance,
  nftInfo,
}) => {
  // Filter
  //   const [breedFilter, setBreedFilter] = useState([])
  //   const [classFilter, setClassFilter] = useState([])

  const { transactions, requests } = state
  const [assetInfo, setAssetInfo] = useState({ symbol: "doge" })
  const transactionMap = transactions.reduce(
    ([stakes], [hash, type, ...args]) => {
      const transaction = {
        stakes: {},
      }
      switch (type) {
        case "buy":
          transaction.stakes[args[0]] = hash
          break
        default:
          break
      }
      return [{ ...stakes, ...transaction.stakes }]
    },
    new Array(4).fill({})
  )

  const { defenders, setDefenders } = useContext(DefenderContext)

  // console.log("transactions 📌", transactions)
  //   const breeds = [
  //     "Shiba",
  //     "Pug",
  //     "Corgi",
  //     "Labrador",
  //     "Dachshund",
  //     "Poodle",
  //     "Pitbull",
  //     "Bulldog",
  //   ]

  const levels = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]

  //   -------------------------------------------------------------------------------------------------------

  const [tokens, setTokens] = useState([])
  const [searchResult, setSearchResult] = useState([])
  const [search, setSearch] = useState("")
  const [userInfo, setUserInfo] = useState({} as any)
  const [statsInfo, setStatsInfo] = useState({} as any)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  // const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [showBattleCompleted, setShowBattleCompleted] = useState(false)
  const [questCompleteDifficulty, setQuestCompleteDifficulty] =
    useState("novice")
  const [questCompleteScore, setQuestCompleteScore] = useState(0)
  const [questCompleteHighScore, setQuestCompleteHighScore] = useState(0)

  const [showRefreshModal, setShowRefreshModal] = useState(false)
  const [refreshModalEntryFee, setRefreshModalEntryFee] = useState("1")

  // context API
  //   const { setDefenders } = useContext(DefenderContext)

  // --------
  const [warriorInGround, setWarriorInGround] = useState<any>()

  const emptyPlayground = () => {
    setWarriorInGround("")
  }
  // Filter
  const [breedFilter, setBreedFilter] = useState([])
  const [classFilter, setClassFilter] = useState([])
  const [levelFilter, setLevelFilter] = useState([])
  const breeds = [
    "Shiba",
    "Pug",
    "Corgi",
    "Labrador",
    "Dachshund",
    "Poodle",
    "Pitbull",
    "Bulldog",
  ]
  const classes = [
    "Warrior",
    "Rogue",
    "Mage",
    "Hunter",
    "Cleric",
    "Bard",
    "Merchant",
    "Forager",
  ]

  // const [txHash, setTxHash] = useState()
  const [confirmModal, setConfirmModal] = useState({
    title: "",
    onConfirmCallback: () => {},
    onCancelCallback: () => {},
  })
  const [refreshModal, setRefreshModal] = useState({
    onConfirmCallback: () => {},
    onCancelCallback: () => {},
  })
  // const [levelUpModal, setLevelUpModal] = useState({
  //   curLevel: "",
  //   onConfirmCallback: (toLevel) => {},
  //   onCancelCallback: () => {},
  // })
  // const [renameModal, setRenameModal] = useState({
  //   curName: "",
  //   onConfirmCallback: (newName) => {},
  //   onCancelCallback: () => {},
  // })
  const [showBridgeModal, setShowBridgeModal] = useState(false)
  const [bridgeInfo, setBridgeInfo] = useState({
    tokens: [],
    treatAmount: 0,
  })
  const [bridgeTxs, setBridgeTxs] = useState([])

  // const updateTokensByToken = (token) => {
  //   setTokens(tokens?.map((o) => (o.tokenId === token.tokenId ? token : o)))
  //   setDefenders(tokens?.map((o) => (o.tokenId === token.tokenId ? token : o)))
  // }

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

  const getUserInfo = () => {
    if (library?.methods?.Treat && library?.methods?.Dogewood) {
      const { balanceOf, allowance } = library?.methods?.Treat
      const { isApprovedForAll } = library?.methods?.Dogewood
      if (account) {
        Promise.all([
          balanceOf(account),
          allowance(account, library.addresses.Dogewood),
          isApprovedForAll(account, library.addresses.Dogewood),
        ])
          .then(([balanceOf, allowance, isApprovedForAll]) => {
            setUserInfo({
              address: account,
              ethBalance: balance,
              treatBalance: balanceOf,
              allowance: allowance,
              isApprovedForAll: isApprovedForAll,
            })
          })
          .catch(console.log)
      }
    }
  }

  const getDoges = (network) => {
    if (account) {
      Promise.all([getDogesByOwner(account, network)])
        .then(async ([doges]) => {
          // console.log(doges)
          Promise.all(doges.map((doge) => getTokenById(Number(doge.id))))
            .then((tokens_) => {
              setTokens(tokens_)
              setDefenders(tokens_)
            })
            .catch(console.log)
        })
        .catch((err) => {
          const options = {
            autoClose: 5000,
          }
          toast.error(
            `subgraph is experiencing issues, so owned doges will not be shown for now!`,
            options
          )
          console.log(err)
        })
    }
  }

  const getBridgeTxs = async () => {
    if (account && library) {
      const [logMain, logBridged, childCounter] = await Promise.all([
        getEthBridgeLogs(account),
        getPolyBridgeLogs(account),
        // getBridgeHistory(account, supportedNetworks[0], true),
        // getBridgeHistory(account, supportedNetworks[1], false),
        getChildCounter(),
      ])

      // let bridgeTxs = []
      // if (logBridged.length)
      //   bridgeTxs = await getHistoryByTxs(logBridged.map((o) => o.txHash))

      let logPoly = logBridged.map((e: any) => {
        const decoded = library.web3.eth.abi.decodeParameters(
          ["uint256[]", "uint256"],
          "0x" + e.input.slice(10)
        )
        // const details = bridgeTxs.find(
        //   (o) => o.txHash.toLowerCase() == e.txHash.toLowerCase()
        // )
        // details = {
        //   blockIncluded: 1,
        //   blockNumber: 23825193,
        //   blockTimestamp: null,
        //   createdAt: "2022-01-20T11:44:00.000Z",
        //   exitPayload: "0xf915cd840fc50490b9016026d0114e14740ee65c22f15e14",
        //   exitPayloadMd5: "2fb723d6830604cb86d8ad2075718dfe",
        //   exitTxHash: "0xbfb77e01dfa7021e1ad17f3cfeeba794ecdacbec4911ea228ac85bd8b704faa4",
        //   from: "0x77e4f140c21c50efdd763a9c0da17785ec9ddeb9",
        //   id: "2777f279-cc7c-44d8-8435-e804e3f5aaf8",
        //   input: "0x04f40cbb00",
        //   message: "0x00000000",
        //   txHash: "0xb3d0e8029a7f2211b99cdf32ec3938c8560dbe51a3776d40c4d580ae4d87e16c",
        //   txIndex: 47,
        //   updatedAt: "2022-01-20T11:45:01.000Z",
        // }
        return {
          ...e,
          fromNetwork: supportedNetworks[1],
          toNetwork: supportedNetworks[0],
          tokenIds: decoded[0].map(Number),
          treatAmount: Web3.utils.fromWei(decoded[1]),
          // details,
        }
      })

      const txs = [
        ...logMain.map((e: any) => {
          const decoded = library.web3.eth.abi.decodeParameters(
            ["uint256[]", "uint256"],
            "0x" + e.input.slice(10)
          )
          return {
            ...e,
            fromNetwork: supportedNetworks[0],
            toNetwork: supportedNetworks[1],
            tokenIds: decoded[0].map(Number),
            treatAmount: Web3.utils.fromWei(decoded[1]),
            status:
              Number(e.syncId) <= childCounter ? "Completed" : "In progress",
          }
        }),
        ...logPoly,
      ].sort((a, b) => b.blockTimestamp - a.blockTimestamp) // Number(b.timestamp) - Number(a.timestamp)

      setBridgeTxs(txs)
    }
  }

  const getStatsInfo = () => {
    if (library?.methods?.Treat && library?.methods?.Dogewood) {
      const { totalSupply: treatTotalSupply } = library?.methods?.Treat
      Promise.all([
        getStats(network),
        account
          ? treatTotalSupply()
          : new Promise((res, rej) => {
              res(0)
            }),
      ])
        .then(([stat, treatTotalSupply]) => {
          setStatsInfo({
            dogeTotalSupply: stat?.totalSupply,
            dogeStaked: stat?.totalStaked,
            dogeUniqueOwner: stat?.uniqueOwner,
            treatTotalSupply,
          })
        })
        .catch(console.log)
    }
  }

  const handleFilter = () => {
    let filteredRes
    if (breedFilter?.length && !levelFilter?.length) {
      filteredRes = tokens?.filter((token) =>
        breedFilter?.includes(token.tokenURI.attributes[1].value)
      )
    }
    if (levelFilter?.length && !breedFilter?.length) {
      filteredRes = tokens?.filter((token) =>
        levelFilter?.includes(token.tokenURI.attributes[7].value)
      )
    }
    if (classFilter) {
      filteredRes = tokens?.filter((token) =>
        classFilter?.includes(token.tokenURI.attributes[3].value)
      )
    }
    if (levelFilter?.length && breedFilter?.length) {
      filteredRes = tokens?.filter(
        (token) =>
          breedFilter?.includes(token.tokenURI.attributes[1].value) &&
          levelFilter?.includes(token.tokenURI.attributes[7].value)
      )
    }
    if (levelFilter?.length && classFilter) {
      filteredRes = tokens?.filter(
        (token) =>
          classFilter?.includes(token.tokenURI.attributes[3].value) &&
          levelFilter?.includes(token.tokenURI.attributes[7].value)
      )
    }
    if (breedFilter?.length && classFilter) {
      filteredRes = tokens?.filter(
        (token) =>
          classFilter?.includes(token.tokenURI.attributes[3].value) &&
          breedFilter?.includes(token.tokenURI.attributes[1].value)
      )
    }
    if (levelFilter?.length && breedFilter?.length && classFilter) {
      filteredRes = tokens?.filter(
        (token) =>
          breedFilter?.includes(token.tokenURI.attributes[1].value) &&
          levelFilter?.includes(token.tokenURI.attributes[7].value) &&
          classFilter?.includes(token.tokenURI.attributes[3].value)
      )
    }
    return filteredRes
  }

  const handleTransaction =
    (type, ...args) =>
    (transaction, callback = () => {}) => {
      dispatch({
        type: "txRequest",
        payload: [type, true, ...args],
      })
      transaction
        .on("transactionHash", function (hash) {
          dispatch({
            type: "txHash",
            payload: [hash, false, type, ...args],
          })
        })
        .on("receipt", function (receipt) {
          dispatch({
            type: "txHash",
            payload: [receipt.transactionHash, true, type, callback()],
          })
        })
        .on("error", (err, receipt) => {
          if (err && err.message) {
            console.log(err.message)
          }
          if (receipt) {
            dispatch({
              type: "txHash",
              payload: [receipt.transactionHash, true, type],
            })
          } else {
            dispatch({
              type: "txRequest",
              payload: [type, false, ...args],
            })
          }
        })
    }

  const openConfirmModal = (
    title,
    onConfirmCallback?: () => void,
    onCancelCallback?: () => void
  ) => {
    setConfirmModal({ title, onConfirmCallback, onCancelCallback })
    setShowConfirmModal(true)
  }

  const openRefreshModal = (
    onConfirmCallback?: () => void,
    onCancelCallback?: () => void
  ) => {
    setRefreshModal({ onConfirmCallback, onCancelCallback })
    setShowRefreshModal(true)
  }

  const handleApproveTreat = (callback) => {
    if (account && library?.methods?.Treat) {
      const { approve } = library?.methods?.Treat
      const transaction = approve(library?.addresses?.Dogewood, MAX_UINT256, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction("approve", "treat")(transaction.send(), () => {
        setUserInfo({
          ...userInfo,
          allowance: MAX_UINT256,
        })
      })
    }
  }

  const [selectedDefenders, setSelectedDefenders] = useState([])

  const handleDefenderSelect = (id) => {
    selectedDefenders.includes(id)
      ? setSelectedDefenders(selectedDefenders.filter((d) => d !== id))
      : setSelectedDefenders([...selectedDefenders, id])
  }

  useEffect(() => {
    getUserInfo(), getDoges(network), getStatsInfo()
    getBridgeTxs()
  }, [library, network])
  const isStaked = (token) =>
    token?.activities?.action === "1" &&
    token?.activities?.owner === userInfo?.address

  const handleStartQuest = () => {
    if (!isPolygon) {
      toast.error(`Should be polygon network.`)
      return
    }
    if (!warriorInGround?.tokenId) {
      const options = {
        autoClose: 5000,
      }
      toast.error(`Doge not selected yet`, options)
      return
    }
    if (account && library?.methods?.Quest) {
      const { combatSingle, _dogeLastScore } = library?.methods?.Battle
      const { getDogeEntryFee, getScore } = library?.methods?.Quest
      // get doge entry fee
      getDogeEntryFee(warriorInGround?.tokenId)
        .then((entryFee) => {
          if (entryFee != 0) {
            setShowRefreshModal(true)
          }
          const _makeTransaction = () => {
            const transaction = combatSingle(warriorInGround?.tokenId, {
              maxPriorityFeePerGas: null,
              maxFeePerGas: null,
              from: account,
              gas: Web3.utils.toHex(6000000),
            })
            handleTransaction("quest", warriorInGround?.tokenId)(
              transaction.send(),
              () => {
                const levelTrait_ =
                  warriorInGround?.tokenURI?.attributes?.filter(
                    (o) => o.trait_type === "level"
                  )
                setQuestCompleteDifficulty(
                  getDifficulty(getGroupIndex(levelTrait_?.value))
                )

                setQuestCompleteHighScore(0)
                getScore(account, warriorInGround?.tokenId)
                  .then((_score) => {
                    setQuestCompleteHighScore(_score)
                  })
                  .catch((e) => {
                    const options = {
                      autoClose: 5000,
                    }
                    toast.error(`Can't get high score`, options)
                  })

                setQuestCompleteScore(0)
                _dogeLastScore(warriorInGround?.tokenId)
                  .then((_score) => {
                    setQuestCompleteScore(_score)
                  })
                  .catch((e) => {
                    const options = {
                      autoClose: 5000,
                    }
                    toast.error(`Can't get last battle score`, options)
                  })

                setShowBattleCompleted(true)
              }
            )
          }

          let entryFee_ = new BigNumber(entryFee)
          if (entryFee_.lte(userInfo?.treatBalance)) {
            if (entryFee_.gt(userInfo?.allowance)) {
              openConfirmModal(
                "You have to approve $TREAT token first to start quest.",
                () => {
                  handleApproveTreat(_makeTransaction)
                }
              )
            } else {
              if (entryFee_.gt(0)) {
                // should show alert modal
                setRefreshModalEntryFee(
                  `${toFixed(Web3.utils.fromWei(entryFee), 2)}`
                )
                openRefreshModal(
                  () => {
                    _makeTransaction()
                  },
                  () => {}
                )
              } else {
                _makeTransaction()
              }
            }
          } else {
            const options = {
              autoClose: 5000,
            }
            toast.error(`Not enough entry fee`, options)
          }
        })
        .catch((err) => {
          const options = {
            autoClose: 5000,
          }
          toast.error(`Network error in getting entry fee`, options)
        })
    }
  }

  const [gas, setGas] = useState(0)
  useEffect(() => {
    fetchAverageGas().then((res) => setGas(res.average / 10))
  }, [])

  const checkTired = async (token) => {
    if (account && library?.methods?.Quest) {
      const { getDogeEntryFee } = library?.methods?.Quest

      // get doge entry fee
      const fee = await getDogeEntryFee(token?.tokenId)

      return fee
    }
  }
  return (
    <div className={styles.game_wrapper}>
      <div className={styles.game_container}>
        <div className={styles.game_content}>
          <div className={styles.game_top}>
            <div className={styles.render_field}>
              <div className={styles.field_slot_one}>
                {warriorInGround?.tokenId ? (
                  <DefenderOnField
                    token={warriorInGround}
                    userInfo={userInfo}
                    emptyPlayground={emptyPlayground}
                  />
                ) : (
                  <span className={styles.add_btn}>
                    <AiOutlinePlus className={styles.icon} />
                  </span>
                )}
              </div>
              <Button onClick={handleStartQuest} className="quest_button">
                Start Quest
              </Button>
            </div>
          </div>
          <div className={styles.game_bottom}>
            {/* Game Header section */}
            <div className={styles.game_header}>
              <div className={styles.left_search}>
                <form>
                  <input
                    type="text"
                    placeholder="Search"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <BiSearchAlt2 className={styles.icon} />
                </form>
              </div>
              <div className={styles.right_filter}>
                <form>
                  <select
                    onChange={(e) => {
                      if (
                        breedFilter?.includes(e.target.value) ||
                        e.target.value == "Class: All"
                      ) {
                        return null
                      }
                      setClassFilter([e.target.value])
                    }}
                  >
                    <option>Class: All</option>
                    {classes?.map((class_) => (
                      <option key={class_} value={class_}>
                        {class_}
                      </option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => {
                      if (
                        breedFilter?.includes(e.target.value) ||
                        e.target.value == "Breed: All"
                      ) {
                        return null
                      }
                      setBreedFilter([...breedFilter, e.target.value])
                    }}
                  >
                    <option>Breed: All</option>
                    {breeds?.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => {
                      if (
                        breedFilter?.includes(e.target.value) ||
                        e.target.value == "Level: High To Low"
                      ) {
                        return
                      }
                      setLevelFilter([+e.target.value])
                    }}
                  >
                    <option>Level: High To Low</option>
                    {levels.reverse().map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </form>
                {/* --------filters list */}

                {breedFilter?.length > 0 && (
                  <div className={styles.filter_box}>
                    <span className={styles.filter_label}>Breed Filter</span>
                    <div className={styles.activeFilters}>
                      {breedFilter?.map((breed) => (
                        <span key={breed}>
                          {breed}{" "}
                          <MdClose
                            className={styles.icon}
                            onClick={() =>
                              setBreedFilter(
                                breedFilter?.filter((breed_) => breed_ != breed)
                              )
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class filters */}

                {classFilter?.length > 0 && (
                  <div className={styles.filter_box}>
                    <span className={styles.filter_label}>Class Filters</span>
                    <div className={styles.activeFilters}>
                      {classFilter?.map((breed) => (
                        <span key={breed}>
                          {breed}{" "}
                          <MdClose
                            className={styles.icon}
                            onClick={() =>
                              setClassFilter(
                                classFilter?.filter((breed_) => breed_ != breed)
                              )
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Header section ends */}
            {/* Select warrier section */}
            {Number(search) ? (
              <div className={styles.warrior_collection}>
                {searchResult.map((token) => (
                  <div onClick={() => setWarriorInGround(token)}>
                    <Defender_round
                      key={token?.tokenId}
                      token={token}
                      // userInfo={userInfo}
                      // onStake={handleStake}
                      // onUnstake={handleUnstake}
                      // onLevelUp={handleLevelUp}
                      // onReroll={handleReroll}
                      // onRecruit={handleRecruit}
                      // onClaim={handleClaim}
                      // onBridge={handleBridge}
                      // onRename={handleRename}
                      // onChangeArt={handleChangeArt}
                      handleDefenderSelect={handleDefenderSelect}
                      // isPolygon={isPolygon(network)}
                      // setWarriorInGround={setWarriorInGround}
                      // isDefenderinField={
                      //   warriorInGround?.tokenId ? true : false
                      // }
                      selected={warriorInGround?.tokenId === token?.tokenId}
                      tired={checkTired(token)}
                    />
                  </div>
                ))}
              </div>
            ) : breedFilter?.length || classFilter?.length ? (
              <div className={styles.warrior_collection}>
                {handleFilter().map((token) => (
                  <div onClick={() => setWarriorInGround(token)}>
                    <Defender_round
                      token={token}
                      // userInfo={userInfo}
                      key={token?.tokenId}
                      // onStake={handleStake}
                      // onUnstake={handleUnstake}
                      // onLevelUp={handleLevelUp}
                      // onReroll={handleReroll}
                      // onRecruit={handleRecruit}
                      // onClaim={handleClaim}
                      // onBridge={handleBridge}
                      // onRename={handleRename}
                      // onChangeArt={handleChangeArt}
                      handleDefenderSelect={handleDefenderSelect}
                      // isPolygon={isPolygon(network)}
                      // setWarriorInGround={setWarriorInGround}
                      // isDefenderinField={warriorInGround ? true : false}
                      selected={warriorInGround?.tokenId === token?.tokenId}
                      tired={checkTired(token)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.warrior_collection}>
                {tokens.map((token) => (
                  <div
                    onClick={() => {
                      setWarriorInGround(token)
                      checkTired(token)
                    }}
                  >
                    <Defender_round
                      token={token}
                      // userInfo={userInfo}
                      key={token?.tokenId}
                      // onStake={handleStake}
                      // onUnstake={handleUnstake}
                      // onLevelUp={handleLevelUp}
                      // onReroll={handleReroll}
                      // onRecruit={handleRecruit}
                      // onClaim={handleClaim}
                      // onBridge={handleBridge}
                      // onRename={handleRename}
                      // onChangeArt={handleChangeArt}
                      handleDefenderSelect={handleDefenderSelect}
                      // isPolygon={isPolygon(network)}
                      // setWarriorInGround={setWarriorInGround}
                      // isDefenderinField={
                      //   warriorInGround?.tokenId ? true : false
                      // }
                      selected={warriorInGround?.tokenId === token?.tokenId}
                      tired={checkTired(token)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Select warrier section ends */}
          </div>
        </div>
      </div>
      {/* <TxModal
        network={network}
        pending={assetInfo && requests.buy === assetInfo.symbol}
        disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
        onClose={() => setAssetInfo(null)}
      /> */}

      {/* Loading modal */}

      <TxModal
        network={network}
        pending={transactions?.length ? transactions[0][0] : 0}
        disabled={transactions?.length ? transactions[0][0] : 0}
      />
      <QuestComplete
        difficulty={questCompleteDifficulty}
        score={questCompleteScore}
        highScore={questCompleteHighScore}
        showBattleCompleted={showBattleCompleted}
        onClose={() => setShowBattleCompleted(false)}
        handleStartQuest={handleStartQuest}
      />
      <RefreshModal
        show={showRefreshModal}
        entryFee={refreshModalEntryFee}
        onConfirm={() => {
          setShowRefreshModal(false)
          refreshModal?.onConfirmCallback
            ? refreshModal?.onConfirmCallback()
            : false
        }}
        onClose={() => setShowRefreshModal(false)}
      />
    </div>
  )
}

export default Game
