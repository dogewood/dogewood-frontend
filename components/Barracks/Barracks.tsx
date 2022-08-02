import {
  FormEvent,
  FormEventHandler,
  useContext,
  useEffect,
  useState,
} from "react"
import BigNumber from "bignumber.js"
import { toast } from "react-hot-toast"
import Web3 from "web3"
import styles from "./Barracks.module.css"
import { BsThreeDotsVertical, BsChevronRight } from "react-icons/bs"
import Defender from "./Defender"
import TxModal from "components/Modal/TxModal"
import ConfirmModal from "components/Modal/ConfirmModal"
import { toFixed } from "utils/number"
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
import { getDogesByOwner, getStats } from "utils/dogewood_subgraph"
import { fetchAverageGas } from "utils/common"
import { shorten } from "utils/string"
import BridgeModal from "components/Modal/BridgeModal"
import BridgeHistoryModal from "components/Modal/BridgeHistoryModal"
import {
  getChildCounter,
  getHistoryByTxs,
  getEthBridgeLogs,
  getPolyBridgeLogs,
} from "utils/api"
import LevelUpModal from "components/Modal/LevelUpModal"
import RenameModal from "components/Modal/RenameModal"
import { HiFilter } from "react-icons/hi"
import { MdClose } from "react-icons/md"
import moment from "moment"
import DefenderContext from "store/store"
import { breedNames, classNames } from "utils/constants"

const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

const Barracks = ({
  library,
  network,
  state,
  dispatch,
  account,
  balance,

  nftInfo,
}) => {
  const [tokens, setTokens] = useState([])
  const [searchResult, setSearchResult] = useState([])
  const [search, setSearch] = useState("")
  const [userInfo, setUserInfo] = useState({} as any)
  const [statsInfo, setStatsInfo] = useState({} as any)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)

  // context API
  const { setDefenders, setBridgeTXS } = useContext(DefenderContext)

  // Filter
  const [breedFilter, setBreedFilter] = useState([])
  const [classFilter, setClassFilter] = useState([])

  const [txHash, setTxHash] = useState("")
  const [confirmModal, setConfirmModal] = useState({
    title: "",
    onConfirmCallback: () => {},
    onCancelCallback: () => {},
  })
  const [levelUpModal, setLevelUpModal] = useState({
    curLevel: "",
    onConfirmCallback: (toLevel) => {},
    onCancelCallback: () => {},
  })
  const [renameModal, setRenameModal] = useState({
    curName: "",
    onConfirmCallback: (newName) => {},
    onCancelCallback: () => {},
  })
  const [showBridgeModal, setShowBridgeModal] = useState(false)
  const [bridgeInfo, setBridgeInfo] = useState({
    tokens: [],
    treatAmount: 0,
  })
  const [bridgeTxs, setBridgeTxs] = useState([])

  const updateTokensByToken = (token) => {
    setTokens(tokens?.map((o) => (o.tokenId === token.tokenId ? token : o)))
    setDefenders(tokens?.map((o) => (o.tokenId === token.tokenId ? token : o)))
  }

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
            {
              position: "bottom-right",
            }
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

      // console.log(txs);
      setBridgeTxs(txs)
      setBridgeTXS(txs)
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

  const handleSearch = (e) => {
    e.preventDefault()
    const tokenId = Number(search)
    if (nftInfo?.totalSupply >= tokenId) {
      getTokenById(tokenId)
        .then((token) => {
          setSearchResult([token])
        })
        .catch(console.log)
    } else {
      setSearchResult([])
    }
  }

  const handleFilter = () => {
    let filteredRes
    if (breedFilter?.length && !classFilter?.length) {
      filteredRes = tokens?.filter((token) =>
        breedFilter?.includes(token.tokenURI.attributes[1].value)
      )
    }
    if (classFilter?.length && !breedFilter?.length) {
      filteredRes = tokens?.filter((token) =>
        classFilter?.includes(token.tokenURI.attributes[3].value)
      )
    }
    if (classFilter?.length && breedFilter?.length) {
      filteredRes = tokens?.filter(
        (token) =>
          breedFilter?.includes(token.tokenURI.attributes[1].value) &&
          classFilter?.includes(token.tokenURI.attributes[3].value)
      )
    }
    return filteredRes
  }
  // console.log(handleFilter(), 'filtered')

  const { transactions, requests } = state

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

  // const handleApproveToken = () => {
  //   if (account && library?.methods?.Dogewood) {
  //     const { setApproveForAll } = library?.methods?.Dogewood
  //     const transaction = setApproveForAll(library?.addresses?.Dogewood, true, {
  //       maxPriorityFeePerGas: null,
  //       maxFeePerGas: null,
  //       from: account,
  //     })
  //     handleTransaction('approve', 'doge')(transaction.send(), () => {})
  //   }
  // }

  const openConfirmModal = (
    title,
    onConfirmCallback?: () => void,
    onCancelCallback?: () => void
  ) => {
    setConfirmModal({ title, onConfirmCallback, onCancelCallback })
    setShowConfirmModal(true)
  }

  const openLevelUpModal = (
    curLevel,
    onConfirmCallback?: (toLevel) => void,
    onCancelCallback?: () => void
  ) => {
    setLevelUpModal({ curLevel, onConfirmCallback, onCancelCallback })
    setShowLevelUpModal(true)
  }

  const openRenameModal = (
    curName,
    onConfirmCallback?: (newName) => void,
    onCancelCallback?: () => void
  ) => {
    setRenameModal({ curName, onConfirmCallback, onCancelCallback })
    setShowRenameModal(true)
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

  const handleClaim = (token) => {
    if (account && library?.methods?.Dogewood) {
      const { claim } = library?.methods?.Dogewood
      if (token?.claimable > 0) {
        const transaction = claim([token?.tokenId], {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("claim", token?.tokenId)(transaction.send(), () => {
          getTokenById(token?.tokenId)
            .then(() => updateTokensByToken(token))
            .catch(console.log)
        })
      }
    }
  }

  const handleStake = (token) => {
    if (account && library?.methods?.Dogewood) {
      const { doAction } = library?.methods?.Dogewood
      const transaction = doAction(token?.tokenId, 1, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction("stake", token?.tokenId)(transaction.send(), () => {
        getTokenById(token?.tokenId)
          .then(() => updateTokensByToken(token))
          .catch(console.log)
        getStatsInfo()
      })
    }
  }

  const handleUnstake = (token) => {
    if (account && library?.methods?.Dogewood) {
      const { doAction } = library?.methods?.Dogewood
      const transaction = doAction(token?.tokenId, 0, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction("unstake", token?.tokenId)(transaction.send(), () => {
        getTokenById(token?.tokenId)
          .then(() => updateTokensByToken(token))
          .catch(console.log)
        getStatsInfo()
      })
    }
  }

  const handleRecruit = (token) => {
    if (account && library?.methods?.Dogewood) {
      const totalSupply = nftInfo?.totalSupply
      const recruitPrice = new BigNumber(getRecruitPrice(totalSupply))
      const _makeTransaction = () => {
        const { recruit } = library?.methods?.Dogewood
        const transaction = recruit(token?.tokenId, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("recruit", token?.tokenId)(transaction.send(), () => {
          getTokenById(token?.tokenId)
            .then(() => updateTokensByToken(token))
            .catch(console.log)
          getStatsInfo()
        })
      }
      if (recruitPrice.lte(userInfo?.treatBalance)) {
        if (recruitPrice.gt(userInfo?.allowance)) {
          openConfirmModal(
            "You have to approve $TREAT token first to recruit.",
            () => {
              handleApproveTreat(_makeTransaction)
            }
          )
        } else {
          _makeTransaction()
        }
      }
    }
  }

  const handleLevelUp = (token, curLevel) => {
    if (account && library?.methods?.Dogewood) {
      openLevelUpModal(curLevel, (toLevel) => {
        // const levelUpPrice = new BigNumber(getLevelUpPrice(Number(curLevel)))
        const levelUpPrice = new BigNumber(
          getMultipleLevelUpPrice(Number(curLevel), Number(toLevel))
        )
        const _makeTransaction = () => {
          const { upgradeLevelWithTreat, upgradeMultipleLevelWithTreat } =
            library?.methods?.Dogewood
          const transaction = upgradeMultipleLevelWithTreat(
            token?.tokenId,
            toLevel,
            {
              maxPriorityFeePerGas: null,
              maxFeePerGas: null,
              from: account,
            }
          )
          handleTransaction("levelUp", token?.tokenId)(
            transaction.send(),
            () => {
              getTokenById(token?.tokenId)
                .then(() => updateTokensByToken(token))
                .catch(console.log)
            }
          )
        }
        if (levelUpPrice.lte(userInfo?.treatBalance)) {
          if (levelUpPrice.gt(userInfo?.allowance)) {
            openConfirmModal(
              "You have to approve $TREAT token first to level up.",
              () => {
                handleApproveTreat(_makeTransaction)
              }
            )
          } else {
            _makeTransaction()
          }
        } else {
          toast.error(`Not enough $TREAT to level up!`, {
            position: "bottom-right",
          })
        }
      })
    }
  }

  const handleReroll = (token, rerollType) => {
    if (account && library?.methods?.Dogewood) {
      const rerollPrice = new BigNumber(
        getRerollPrice(
          Number(rerollType) === 0
            ? token?.rerollBreedCount
            : token?.rerollClassCount
        )
      )
      const _makeTransaction = () => {
        const { rerollWithTreat } = library?.methods?.Dogewood
        const transaction = rerollWithTreat(token?.tokenId, rerollType, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("reroll", token?.tokenId)(transaction.send(), () => {
          getTokenById(token?.tokenId)
            .then(() => updateTokensByToken(token))
            .catch(console.log)
        })
      }
      if (rerollPrice.lte(userInfo?.treatBalance)) {
        if (rerollPrice.gt(userInfo?.allowance)) {
          openConfirmModal(
            "You have to approve $TREAT token first to reroll.",
            () => {
              handleApproveTreat(_makeTransaction)
            }
          )
        } else {
          _makeTransaction()
        }
      }
    }
  }

  const handleClaimBulk = (selectedIds) => {
    if (account && library?.methods?.Dogewood) {
      const { claim } = library?.methods?.Dogewood
      if (selectedIds.length) {
        const transaction = claim(selectedIds, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("claim", selectedIds.join(" "))(
          transaction.send(),
          () => {}
        )
      }
    }
  }

  const handleStakeBulk = (selectedIds) => {
    if (account && library?.methods?.Dogewood) {
      const { doActionWithManyDoges } = library?.methods?.Dogewood
      if (selectedIds.length) {
        const transaction = doActionWithManyDoges(selectedIds, 1, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("stake", selectedIds.join(" "))(
          transaction.send(),
          () => {
            getDoges(network)
            getStatsInfo()
          }
        )
      }
    }
  }

  const handleUnstakeBulk = (selectedIds) => {
    if (account && library?.methods?.Dogewood) {
      const { doActionWithManyDoges } = library?.methods?.Dogewood
      if (selectedIds.length) {
        const transaction = doActionWithManyDoges(selectedIds, 0, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("unstake", selectedIds.join(" "))(
          transaction.send(),
          () => {}
        )
      }
    }
  }

  const [selectedDefenders, setSelectedDefenders] = useState([])
  const [selectedDefendersLevel, setSelectedDefendersLevel] = useState([])

  const handleDefenderSelect = (id, level) => {
    selectedDefenders.includes(id)
      ? setSelectedDefenders(selectedDefenders.filter((d) => d !== id))
      : setSelectedDefenders([...selectedDefenders, id])
    setSelectedDefendersLevel([...selectedDefendersLevel, level])
  }

  const handleBulkActions = (e) => {
    if (selectedDefenders?.length < 1) {
      toast.error("Doges not selected!", {
        position: "bottom-right",
      })
      return
    }
    switch (e.target.value) {
      case "Stake":
        const lowLevel = selectedDefendersLevel.find((level) => level < 20)
        if (lowLevel) {
          toast.error("You must be level 20 to stake", {
            position: "bottom-right",
          })
          return
        }

        handleStakeBulk(selectedDefenders)
        break

      case "Unstake":
        handleUnstakeBulk(selectedDefenders)
        break

      case "Claim":
        handleClaimBulk(selectedDefenders)
        break

      case "Bridge":
        handleBridge(selectedDefenders, 0)
      default:
        break
    }
  }

  useEffect(() => {
    getUserInfo(), getDoges(network), getStatsInfo()
    getBridgeTxs()
  }, [library, network])

  const isStaked = (token) =>
    token?.activities?.action === "1" &&
    token?.activities?.owner === userInfo?.address
  const getStakedCount = () => {
    if (tokens?.length) {
      let stakedDoges_ = tokens.filter((o) => isStaked(o))
      return stakedDoges_.length
    }
    return 0
  }
  const getTreatClaimable = () => {
    let claimable_ = new BigNumber(0)
    if (tokens?.length) {
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].claimable)
          claimable_ = claimable_.plus(new BigNumber(tokens[i].claimable))
      }
    }
    return claimable_.toString(10)
  }

  const handleClaimAllTreat = () => {
    if (account && library?.methods?.Dogewood) {
      const { claim } = library?.methods?.Dogewood
      let stakedDogeIds_ = tokens
        ?.filter((o) => isStaked(o))
        .map((o) => o.tokenId)
      if (stakedDogeIds_?.length) {
        const transaction = claim(stakedDogeIds_, {
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
        })
        handleTransaction("claim", stakedDogeIds_.join(" "))(
          transaction.send(),
          () => {
            getDoges(network)
            getStatsInfo()
          }
        )
      }
    }
  }

  const handleBridge = (tokens = [], treatAmount = 0) => {
    setBridgeInfo({
      tokens,
      treatAmount,
    })
    setShowBridgeModal(true)
  }

  const handleConfirmBridge = (tokens = [], treatAmount = 0) => {
    // const tokenIds = tokens.map(token => token.tokenId)
    const tokenIds = tokens
    const amount = Web3.utils.toWei(treatAmount.toString()).toString()

    const fromNet = networks[network]
    const toNet =
      networks[
        network === supportedNetworks[0]
          ? supportedNetworks[1]
          : supportedNetworks[0]
      ]

    const title = `Sending ${tokenIds.length} Doges and ${Number(
      treatAmount
    ).toFixed(4)} $Treat tokens to ${toNet.name} network`

    if (account && library?.methods?.Castle) {
      const { travel } = library?.methods?.Castle
      const transaction = travel(tokenIds, amount, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction(title)(transaction.send(), () => {
        getDoges(network)
        getUserInfo()
      })
    }
  }

  const handleFinalizeBridgeTx = async (tx) => {
    if (network !== tx.toNetwork) {
      toast.error(
        `Please switch to ${networks[tx.toNetwork].name} to finalize`,
        {
          position: "bottom-right",
        }
      )
      return
    }
    if (
      account &&
      library?.methods?.Portal &&
      network === tx.toNetwork &&
      window?.fetch
    ) {
      let exitPayload = tx?.exitPayload
      if (!tx?.exitPayload) {
        // get exit-payload

        const url =
          tx.toNetwork === 1
            ? `https://apis.matic.network/api/v1/matic/exit-payload/${tx.txHash}?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036`
            : `https://apis.matic.network/api/v1/mumbai/exit-payload/${tx.txHash}?eventSignature=0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036`

        try {
          exitPayload = await window
            .fetch(url)
            .then(async (res) => {
              if (res.ok) {
                return res.json()
              }
              throw new Error(res.statusText)
            })
            .then((data) => {
              return data.result
            })
        } catch (err) {
          toast.error(
            `Burn transaction has not been checkpointed yet. It might take 3 hours.`,
            {
              position: "bottom-right",
            }
          )
          console.log(err)
          return
        }
      }

      const { receiveMessage } = library?.methods?.Portal
      const transaction = receiveMessage(exitPayload, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })

      handleTransaction(
        `Finalizing the bridge transaction ${shorten(tx.txHash, 10)}`
      )(transaction.send(), () => {
        getDoges(network)
        getUserInfo()
      })
    }
  }

  const handleRefreshAfterTx = () => {
    getDoges(network)
    getUserInfo()
  }

  const handleRename = (token) => {
    if (account && library?.methods?.Dogewood) {
      openRenameModal(token?.name, (newName) => {
        const price = getRenamePrice()
        const _makeTransaction = () => {
          const { changeName } = library?.methods?.Dogewood
          const transaction = changeName(token?.tokenId, newName, {
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
            from: account,
          })
          handleTransaction("rename", token?.tokenId)(
            transaction.send(),
            () => {
              getTokenById(token?.tokenId)
                .then(() => updateTokensByToken(token))
                .catch(console.log)
            }
          )
        }
        if (price.lte(userInfo?.treatBalance)) {
          _makeTransaction()
        } else {
          toast.error(`Not enough $TREAT to change name!`, {
            position: "bottom-right",
          })
        }
      })
    }
  }

  const handleChangeArt = (token) => {
    if (account && library?.methods?.Dogewood) {
      const { artStyles, changeArtStyle } = library?.methods?.Dogewood

      artStyles(token?.tokenId)
        .then((style_) => {
          const newStyle_ = 1 - Number(style_)
          const transaction = changeArtStyle(token?.tokenId, newStyle_, {
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
            from: account,
          })
          handleTransaction("changeArt", token?.tokenId)(
            transaction.send(),
            () => {
              getTokenById(token?.tokenId)
                .then((token_) => {
                  updateTokensByToken(token_)
                })
                .catch(console.log)
            }
          )
        })
        .catch((err) => {
          console.log(err)

          toast.error(`Can't read blockchain info!`, {
            position: "bottom-right",
          })
        })
    }
  }

  const [gas, setGas] = useState(0)
  useEffect(() => {
    fetchAverageGas().then((res) => setGas(res.average / 10))
  }, [])

  const checkTiredTimestamp = async (token) => {
    if (!isPolygon(network)) return 0

    if (account && library?.methods?.Dogewood) {
      const { questCooldownLogs } = library?.methods?.Dogewood

      // get doge quest timestamp
      const timestamp = await questCooldownLogs(token?.tokenId)

      return timestamp
    }
  }

  return (
    <div className={styles.barracks_wrapper}>
      <div className={styles.barracks_container}>
        <h1>BARRACKS</h1>

        {/* Stats Starts */}
        <div className={styles.barracks_stats}>
          <div className={styles.stats_left}>
            <h4>Game Stats:</h4>
            <p>
              Total Doges: <span>5001</span>
            </p>
            <p>
              Staked: <span>{statsInfo?.dogeStaked}</span>
            </p>
            <p>
              Unique Owners: <span> {statsInfo?.dogeUniqueOwner}</span>
            </p>
            <p>
              $Treat Supply:{" "}
              <span>
                {userInfo?.treatBalance
                  ? toFixed(Web3.utils.fromWei(userInfo?.treatBalance), 4)
                  : "-"}
              </span>
            </p>
          </div>
          {/* Left ends */}
          {/* Right */}
          <div className={styles.stats_right}>
            <p>$TREAT:</p>
            <h4 className={styles.count}>
              {userInfo?.treatBalance
                ? toFixed(Web3.utils.fromWei(userInfo?.treatBalance), 4)
                : "-"}
            </h4>
            <div className={styles.other_stats}>
              <p>
                Gas: <span>{gas}</span>
              </p>
              <p>
                Claimable:{" "}
                <span>
                  {toFixed(Web3.utils.fromWei(getTreatClaimable()), 4)}
                </span>
              </p>
              <button onClick={handleClaimAllTreat}>Claim All</button>
            </div>
          </div>
          {/* Right ends */}
        </div>

        {/* Stats Ends */}
        <div className={styles.barracks_nav}>
          {/* <div className={styles.nav_title}>My Doges</div> */}

          <div className={styles.left}>
            <div className={styles.owned}>
              {/* Left  */}
              <div className={styles.owned_s}>
                <p>My Doges Owned </p>
                <h4 className={styles.count}>{tokens?.length}</h4>
                {/* <div className={styles.action_buttons}>
                <button>Recruit Doge</button>
              </div> */}
              </div>
              <div className={styles.staked}>
                <p>My Doges Staked</p>
                <h4 className={styles.count}>{getStakedCount()}</h4>
                {/* <div className={styles.action_buttons}>
              <p>Doges Staked</p>
              <h4 className={styles.count}>2</h4>
              <div className={styles.action_buttons}>
                <button>Stake</button>
                <button>Unstake</button>
              </div> */}
              </div>
            </div>
            <div className={styles.filter}>
              <HiFilter style={{ color: "#fff", fontSize: "26px" }} />
              <select
                onChange={(e) => {
                  if (
                    breedFilter?.includes(e.target.value) ||
                    e.target.value == "Breed"
                  ) {
                    return
                  }
                  setBreedFilter([...breedFilter, e.target.value])
                }}
              >
                <option>Breed</option>
                {breedNames?.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
              <select
                onChange={(e) => {
                  if (
                    classFilter?.includes(e.target.value) ||
                    e.target.value == "Class"
                  ) {
                    return
                  }
                  setClassFilter([...classFilter, e.target.value])
                }}
              >
                <option>Class</option>
                {classNames?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {(breedFilter.length || classFilter.length) && (
                <div className={styles.filter_title}>
                  <p>Current Filters</p>
                  <p
                    onClick={() => {
                      setBreedFilter([])
                      setClassFilter([])
                    }}
                  >
                    Clear
                  </p>
                </div>
              )}

              {(breedFilter.length || classFilter.length) && (
                <div className={styles.activeFilters}>
                  {breedFilter?.map((f) => (
                    <span key={f}>
                      {f}{" "}
                      <MdClose
                        className={styles.icon}
                        onClick={() =>
                          setBreedFilter(
                            breedFilter?.filter((breed) => breed != f)
                          )
                        }
                      />
                    </span>
                  ))}
                  {classFilter?.map((f) => (
                    <span key={f}>
                      {f}{" "}
                      <MdClose
                        className={styles.icon}
                        onClick={() =>
                          setClassFilter(classFilter?.filter((c) => c != f))
                        }
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.right}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search Doge ID"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <form>
              {/* <label>{`Bulk Actions (${selectedDefenders.length} Doge):`}</label><br/> */}
              <select value="" onChange={handleBulkActions}>
                <option value="">Bulk Actions</option>
                <option value="Stake">Stake</option>
                <option value="Unstake">Unstake</option>
                <option value="Claim">Claim</option>
                <option value="Bridge">Bridge</option>
              </select>
            </form>
          </div>
        </div>
        {Number(search) ? (
          <div className={styles.card_wrapper}>
            {searchResult.map((token) => (
              <Defender
                token={token}
                userInfo={userInfo}
                key={token?.tokenId}
                onStake={handleStake}
                onUnstake={handleUnstake}
                onLevelUp={handleLevelUp}
                onReroll={handleReroll}
                onRecruit={handleRecruit}
                onClaim={handleClaim}
                onBridge={handleBridge}
                onRename={handleRename}
                onChangeArt={handleChangeArt}
                handleDefenderSelect={handleDefenderSelect}
                isPolygon={isPolygon(network)}
                tired={checkTiredTimestamp(token)}
              />
            ))}
          </div>
        ) : breedFilter?.length || classFilter?.length ? (
          <div className={styles.card_wrapper}>
            {handleFilter().map((token) => (
              <Defender
                token={token}
                userInfo={userInfo}
                key={token?.tokenId}
                onStake={handleStake}
                onUnstake={handleUnstake}
                onLevelUp={handleLevelUp}
                onReroll={handleReroll}
                onRecruit={handleRecruit}
                onClaim={handleClaim}
                onBridge={handleBridge}
                onRename={handleRename}
                onChangeArt={handleChangeArt}
                handleDefenderSelect={handleDefenderSelect}
                isPolygon={isPolygon(network)}
                tired={checkTiredTimestamp(token)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.card_wrapper}>
            {tokens.map((token) => (
              <Defender
                token={token}
                userInfo={userInfo}
                key={token?.tokenId}
                onStake={handleStake}
                onUnstake={handleUnstake}
                onLevelUp={handleLevelUp}
                onReroll={handleReroll}
                onRecruit={handleRecruit}
                onClaim={handleClaim}
                onBridge={handleBridge}
                onRename={handleRename}
                onChangeArt={handleChangeArt}
                handleDefenderSelect={handleDefenderSelect}
                isPolygon={isPolygon(network)}
                tired={checkTiredTimestamp(token)}
              />
            ))}
          </div>
        )}
        <TxModal
          network={network}
          pending={transactions?.length ? transactions[0][0] : 0}
          disabled={transactions?.length ? transactions[0][0] : 0}
        />
        <ConfirmModal
          show={showConfirmModal}
          title={confirmModal?.title}
          onConfirm={() => {
            setShowConfirmModal(false)
            confirmModal?.onConfirmCallback
              ? confirmModal?.onConfirmCallback()
              : false
          }}
          onCancel={() => {
            setShowConfirmModal(false)
            confirmModal?.onCancelCallback
              ? confirmModal?.onCancelCallback()
              : false
          }}
        />
        <LevelUpModal
          show={showLevelUpModal}
          curLevel={Number(levelUpModal?.curLevel)}
          onConfirm={(toLevel) => {
            setShowLevelUpModal(false)
            levelUpModal?.onConfirmCallback
              ? levelUpModal?.onConfirmCallback(toLevel)
              : false
          }}
          onCancel={() => {
            setShowLevelUpModal(false)
            levelUpModal?.onCancelCallback
              ? levelUpModal?.onCancelCallback()
              : false
          }}
        />
        <BridgeModal
          show={showBridgeModal}
          selectedTokens={bridgeInfo.tokens}
          treatBalance={Web3.utils.fromWei(
            userInfo?.treatBalance?.toString() || "0"
          )}
          onConfirm={(tokens, treatAmount) => {
            setShowBridgeModal(false)
            handleConfirmBridge(tokens, treatAmount)
          }}
          onCancel={() => {
            setShowBridgeModal(false)
          }}
        />
        <RenameModal
          show={showRenameModal}
          curName={renameModal?.curName}
          onConfirm={(newName) => {
            setShowRenameModal(false)
            renameModal?.onConfirmCallback
              ? renameModal?.onConfirmCallback(newName)
              : false
          }}
          onCancel={() => {
            setShowRenameModal(false)
            renameModal?.onCancelCallback
              ? renameModal?.onCancelCallback()
              : false
          }}
        />
        <BridgeHistoryModal
          show={state.showBridgeHistory}
          // transactions={bridgeTxs}
          onCancel={() => dispatch({ type: "toggleHistoryModal" })}
          // onFinalize={handleFinalizeBridgeTx}
          onRefreshAfterTx={handleRefreshAfterTx}
          dispatch={dispatch}
          network={network}
          library={library}
          account={account}
        />
      </div>
    </div>
  )
}

export default Barracks
