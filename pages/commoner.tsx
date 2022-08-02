import Web3 from "web3"
import BigNumber from "bignumber.js"
import BuyForm from "components/Modal/BuyForm"
import ClaimForm from "components/Modal/ClaimForm"
import TxModal from "components/Modal/TxModal"
import ConfirmModal from "components/Modal/ConfirmModal"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import styles from "styles/Home.module.css"
import whitelist from "utils/whitelist.json"
import { toFixed } from "utils/number"
import { MAX_UINT256 } from "utils/constants"
import { getCommonersClaimInfo } from "utils/api"

const commoner = ({ library, state, networks, dispatch, connectWallet }) => {
  const [assetInfo, setAssetInfo] = useState({ symbol: "doge" })
  const [totalSupply, setTotalSupply] = useState(0)
  const [userInfo, setUserInfo] = useState({} as any)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    title: "",
    onConfirmCallback: () => {},
    onCancelCallback: () => {},
  })
  const { transactions, requests } = state
  const network = library ? library.wallet.network : ""
  const account = library ? library.wallet.address : ""
  const toWei = (value, decimals = 18) =>
    decimals < 18
      ? new BigNumber(value).times(10 ** decimals).toString(10)
      : library.web3.utils.toWei(value)

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

  //   Handle transaction func
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

  const handleApproveWeth = (callback) => {
    if (account && library?.methods?.Weth) {
      const { approve } = library?.methods?.Weth
      const transaction = approve(library?.addresses?.Commoners, MAX_UINT256, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction("approve", "weth")(transaction.send(), () => {
        setUserInfo({
          ...userInfo,
          wethAllowance: MAX_UINT256,
        })
      })
    }
  }

  const handleApproveTreat = (callback) => {
    if (account && library?.methods?.Treat) {
      const { approve } = library?.methods?.Treat
      const transaction = approve(library?.addresses?.Commoners, MAX_UINT256, {
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        from: account,
      })
      handleTransaction("approve", "treat")(transaction.send(), () => {
        setUserInfo({
          ...userInfo,
          treatAllowance: MAX_UINT256,
        })
      })
    }
  }

  //   Handle Claim All
  // const handleClaimAll = (form) => {
  //   if (!library) return null
  //   if (
  //     window.ethereum &&
  //     !networks.includes(state.account.network) &&
  //     account
  //   ) {
  //     const options = {
  //       autoClose: 5000,
  //     }
  //     toast.error(
  //       `You are conected to wrong network. Please connect to ${
  //         process.env.APP_ENV === "dev" ? "Goerli Testnet" : "Ethereum Mainnet"
  //       }!`,
  //       options
  //     )
  //   } else if (!account) {
  //     connectWallet()
  //   } else {
  //     const { dogeIds } = form
  //     // console.log({dogeIds});
  //     setAssetInfo({ symbol: "doge" })
  //     const { claimMint } = library.methods.Commoners
  //     const transaction = claimMint(dogeIds, {
  //       type: "0x2",
  //       maxPriorityFeePerGas: null,
  //       maxFeePerGas: null,
  //       from: account,
  //       value: toWei("0", 18),
  //     })
  //     handleTransaction("buy", "doge")(transaction.send(), () => {})
  //   }
  // }

  // //   Handle buy func
  // const handleBuyWL = (form) => {
  //   if (!library) return null
  //   if (
  //     window.ethereum &&
  //     !networks.includes(state.account.network) &&
  //     account
  //   ) {
  //     const options = {
  //       autoClose: 5000,
  //     }
  //     toast.error(
  //       `You are conected to wrong network. Please connect to ${
  //         process.env.APP_ENV === "dev" ? "Goerli Testnet" : "Ethereum Mainnet"
  //       }!`,
  //       options
  //     )
  //   } else if (!account) {
  //     connectWallet()
  //   } else {
  //     const { ethAmount, amount } = form
  //     setAssetInfo({ symbol: "doge" })
  //     const { whitelistMint } = library.methods.Commoners
  //     const transaction = whitelistMint(amount, whitelistSignature, {
  //       type: "0x2",
  //       maxPriorityFeePerGas: null,
  //       maxFeePerGas: null,
  //       from: account,
  //       value: toWei(ethAmount.toString(10), 18),
  //     })
  //     handleTransaction("buy", "doge")(transaction.send(), () => {})
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

  //   Handle buy func
  const handleBuyPublicWeth = (form) => {
    if (!library) return null
    if (
      window.ethereum &&
      !isPolygon(state.account.network) &&
      account
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === "dev" ? "Mumbai Testnet" : "Polygon Mainnet"
        }!`,
        options
      )
    } else if (!account) {
      connectWallet()
    } else {
      const { cost, amount } = form

      const _makeTransaction = () => {
        setAssetInfo({ symbol: "doge" })
        const { publicMint } = library.methods.Commoners
        const transaction = publicMint(amount, false, {
          type: "0x2",
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
          // value: cost,
        })
        handleTransaction("buy", "doge")(transaction.send(), () => {})
      }

      let cost_ = new BigNumber(cost)
      if (cost_.gt(userInfo?.wethAllowance)) {
        openConfirmModal(
          "You have to approve $WETH token first to mint.",
          () => {
            handleApproveWeth(_makeTransaction)
          }
        )
      } else {
        _makeTransaction()
      }
    }
  }

  //   Handle buy func
  const handleBuyPublicTreat = (form) => {
    if (!library) return null
    if (
      window.ethereum &&
      !isPolygon(state.account.network) &&
      account
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === "dev" ? "Mumbai Testnet" : "Polygon Mainnet"
        }!`,
        options
      )
    } else if (!account) {
      connectWallet()
    } else {
      const { cost, amount } = form

      const _makeTransaction = () => {
        setAssetInfo({ symbol: "doge" })
        const { publicMint } = library.methods.Commoners
        const transaction = publicMint(amount, true, {
          type: "0x2",
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          from: account,
          // value: cost,
        })
        handleTransaction("buy", "doge")(transaction.send(), () => {})
      }

      _makeTransaction()

      // let cost_ = new BigNumber(cost)
      // if (cost_.gt(userInfo?.treatAllowance)) {
      //   openConfirmModal(
      //     "You have to approve $TREAT token first to mint.",
      //     () => {
      //       handleApproveTreat(_makeTransaction)
      //     }
      //   )
      // } else {
      //   _makeTransaction()
      // }
    }
  }

  const router = useRouter()
  const isPolygon = (network) => [137, 80001].includes(network)
  // const network = library ? library.wallet.network : ""
  useEffect(() => {
    if (!isPolygon(network)) {
      router.push("/")
    }

    // get sale info
    // getInitialSaleMinted()
    getTotalSupply()
  }, [network, assetInfo && transactionMap[0][assetInfo.symbol]])

  useEffect(() => {
    if (!isPolygon(network)) {
      return;
    }

    getUserInfo()
  }, [account, assetInfo && transactionMap[0][assetInfo.symbol]])


  const getUserInfo = () => {
    if (library?.methods?.Treat && library?.methods?.Weth && library?.methods?.Commoners) {
      const { balanceOf: treatBalanceOf, allowance: treatAllowance } = library?.methods?.Treat
      const { balanceOf: wethBalanceOf, allowance: wethAllowance } = library?.methods?.Weth
      if (account) {
        Promise.all([
          treatBalanceOf(account),
          treatAllowance(account, library.addresses.Commoners),
          wethBalanceOf(account),
          wethAllowance(account, library.addresses.Commoners),
        ])
          .then(([treatBalanceOf, treatAllowance, wethBalanceOf, wethAllowance]) => {
            setUserInfo({
              address: account,
              treatBalance: treatBalanceOf,
              treatAllowance: treatAllowance,
              wethBalance: wethBalanceOf,
              wethAllowance: wethAllowance,
            })
          })
          .catch(console.log)
      }
    }
  }

  // const getBalanceInfo = async () => {
  //   if(account) {
  //     const { balanceOf: treatBalanceOf } = library?.methods?.Treat
  //     const { balanceOf: wethBalanceOf } = library?.methods?.Weth
  //     if(treatBalanceOf) {
  //       treatBalanceOf(account)
  //         .then((bal_) => setTreatBalance(Number(toFixed(Web3.utils.fromWei(bal_), 4)) || 0))
  //         .catch(console.log)
  //     }
  //     if(wethBalanceOf) {
  //       wethBalanceOf(account)
  //         .then((bal_) => setWethBalance(Number(toFixed(Web3.utils.fromWei(bal_), 6)) || 0))
  //         .catch(console.log)
  //     }
  //   }
  // }
  
  // const getClaimInfo = async () => {
  //   if(account) {
  //     const { balanceOf: treatBalanceOf } = library?.methods?.Treat
  //     if(treatBalanceOf) {
  //       treatBalanceOf(account)
  //         .then((bal_) => setTreatBalance(Number(toFixed(Web3.utils.fromWei(bal_), 4)) || 0))
  //         .catch(console.log)
  //     }

  //     let claimInfo_ = await getCommonersClaimInfo(account);
  //     // [{dogeId: 12, claimed: true},{dogeId: 13, claimed: false},{dogeId: 14, claimed: false}]
  //     setClaimInfo(claimInfo_?.claimInfo || []);
  //   }
  // }
  
  // const getWhitelistMinted = () => {
  //   if (library?.methods?.Commoners) {
  //     const { whitelistMinted: whitelistMintedCall } = library?.methods?.Commoners
  //     if (whitelistMintedCall && account) {
  //       whitelistMintedCall(account)
  //         .then((amount_) => {
  //           setWhitelistMinted(Number(amount_) || 0)
  //         })
  //         .catch(console.log)
  //     }
  //   }
  // }

  // const getInitialSaleMinted = () => {
  //   if (library?.methods?.Commoners) {
  //     const { initialSaleMinted } = library?.methods?.Commoners
  //     if (initialSaleMinted) {
  //       initialSaleMinted()
  //         .then((amount_) => {
  //           setPublicSaleMinted(Number(amount_) || 0)
  //         })
  //         .catch(console.log)
  //     }
  //   }
  // }

  const getTotalSupply = () => {
    if (library?.methods?.Commoners) {
      const { totalSupply: commonersTotalSupply } = library?.methods?.Commoners
      if (commonersTotalSupply) {
        commonersTotalSupply()
          .then((amount_) => {
            setTotalSupply(Number(amount_) || 0)
          })
          .catch(console.log)
      }
    }
  }

  return (
    <div className={styles.section2} id="mint">
      <div className={`${styles.headWrapper} flex-all limited`}>
        <div className={`${styles.title}`}>Mint Your Commoners</div>
        {/* <div className={`${styles.vector}`}></div>
        <div className={`${styles.description}`}>
          Here it is - where you claim your commoners for the journey of their life
          (and yours).
        </div>
        <div className={styles.buy_form_wrapper}>
          <div className={styles.left}>
            <div className={`${styles.buyFormWrapper} flex-all limited`}>
              <div className={`flex-all ${styles.buyWrapper}`}>
                <ClaimForm
                  account={account}
                  // balance={state.balance}
                  treatBalance={treatBalance || 0}
                  totalSupply={totalSupply}
                  claimInfo={claimInfo}
                  network={network}
                  disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
                  onSubmit={handleClaimAll}
                />
              </div>
              <TxModal
                network={network}
                pending={assetInfo && requests.buy === assetInfo.symbol}
                disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
                onClose={() => setAssetInfo(null)}
              />
            </div>
          </div>
        </div> */}
    
        <div className={`${styles.vector}`}></div>
        <div className={`${styles.description}`}>
          Here it is - where you mint your commoners for the journey of their life
          (and yours).
        </div>
      </div>
      <div className={styles.buy_form_wrapper}>
        <div className={styles.left}>
          <div className={`${styles.buyFormWrapper} flex-all limited`}>
            <div className={`flex-all ${styles.buyWrapper}`}>
              <BuyForm
                account={account}
                balance={state.balance}
                userInfo={userInfo || 0}
                // nftInfo={state.nftInfo || {}}
                totalSupply={totalSupply}
                network={network}
                disabled={ assetInfo && transactionMap[0][assetInfo.symbol]}
                onSubmit={handleBuyPublicWeth}
                useTreat={false}
              />
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={`${styles.buyFormWrapper} flex-all limited`}>
            <div className={`flex-all ${styles.buyWrapper}`}>
              <BuyForm
                account={account}
                balance={state.balance}
                userInfo={userInfo || 0}
                // nftInfo={state.nftInfo || {}}
                totalSupply={totalSupply}
                network={network}
                disabled={ assetInfo && transactionMap[0][assetInfo.symbol]}
                onSubmit={handleBuyPublicTreat}
                useTreat={true}
              />
            </div>
          </div>
        </div>

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
        <TxModal
          network={network}
          pending={assetInfo && requests.buy === assetInfo.symbol}
          disabled={assetInfo && transactionMap[0][assetInfo.symbol]}
          onClose={() => setAssetInfo(null)}
        />
      </div>
    </div>
  )
}

export default commoner
