import React, { useReducer, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { Collapse } from "react-collapse"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useWallet from "hooks/useWallet"
import Account from "components/Account/Account"
import { toNumber } from "utils/common"
import { addresses, ZERO, networks, supportedNetworks } from "utils/constants"
import { reducer, initState } from "./store"
import styles from "./Layout.module.css"
import BridgeHistoryModal from "components/Modal/BridgeHistoryModal"
import TxModal from "components/Modal/TxModal"
import ConfirmModal from "components/Modal/ConfirmModal"
import LevelUpModal from "components/Modal/LevelUpModal"
import BridgeModal from "components/Modal/BridgeModal"
import RenameModal from "components/Modal/RenameModal"

const FETCH_TIME = 2
let balanceTimer = null

const networkLabels = {
  1: "Ethereum Network",
  4: "Rinkeby Testnet",
  3: "Ropsten Testnet",
  5: "Goreli Testnet",
  42: "Kovan Testnet",
  56: "Binance Network",
  97: "Binance Testnet",
}

export function accountBalance(library, dispatch) {
  if (!library || !library.initiated) return
  const account = library.wallet.address
  const fromWei = (value, decimals = 18) =>
    decimals < 18 ? value / 10 ** decimals : library.web3.utils.fromWei(value)
  if (!addresses[library.wallet.network] || !account) {
    return
  }
  Promise.all([library.web3.eth.getBalance(account)])
    .then(([_balance]) => {
      const balance = toNumber(fromWei(_balance))

      dispatch({
        type: "balance",
        payload: {
          balance,
        },
      })
    })
    .catch(console.log)
}

export function NetworkSelector({
  networkIds = supportedNetworks,
  onChangeNetwork,
  selectedNetworkId = 1,
}) {
  const nets = networkIds.map((id) => networks[id])
  const selectedNetwork = networks[selectedNetworkId]
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.networkSelector}>
      <div className={styles.currentNetwork} onClick={() => setOpen(!open)}>
        <img
          src={selectedNetwork?.logo}
          alt={selectedNetwork?.name}
          className={styles.networkLogo}
        />
        <img src={"/assets/triangle.svg"} className={styles.dropdownToggle} />
      </div>
      <div className={`${open ? styles.active : ""} ${styles.dropdown}`}>
        {nets.map((network) => (
          <div
            className={styles.dropdownItem}
            onClick={() => {
              setOpen(false)
              onChangeNetwork && onChangeNetwork(network.chainId, network)
            }}
            key={network.chainId}
          >
            <img src={network.logo} alt={network.name} />
            <span>{network.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Layout({ children, router: { route }, networks }) {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initState)
  const [loading, connectWallet, disconnectWallet, library] =
    useWallet(dispatch)
  const [restored, setRestored] = useState(false)
  const [isCollapse, setIsCollapse] = useState(false)

  const network = library ? library.wallet.network : ""
  const isPolygon = (network) => [137, 80001].includes(network)
  const isEth = (network) => [1, 4, 5].includes(network)

  useEffect(() => {
    document.addEventListener("mouseup", (e: any) => {
      const container = document.getElementById("collapse-content")
      if (container && !container.contains(e.target)) {
        setIsCollapse(false)
      }
    })
  }, [])

  useEffect(() => {
    // disconnectWallet()
    if (!library) {
      connectWallet()
    }

    setIsCollapse(false)
    setTimeout(() => {
      if (location.hash) location = location
    }, 0)
  }, [router, library])

  const getBalance = () => {
    accountBalance(library, dispatch)
  }

  useEffect(() => {
    if (library && state.account.address) {
      if (balanceTimer) clearInterval(balanceTimer)
      balanceTimer = setInterval(getBalance, FETCH_TIME * 1000)
      getBalance()
    }
    return () => balanceTimer && clearInterval(balanceTimer)
  }, [library, state.account.address])

  useEffect(() => {
    if (
      window.ethereum &&
      library &&
      library.wallet.network &&
      !supportedNetworks.includes(library.wallet.network) &&
      state.account.address
    ) {
      const options = {
        autoClose: 5000,
      }
      toast.error(
        `You are conected to wrong network. Please connect to ${
          process.env.APP_ENV === "dev"
            ? "Goerli or Mumbai network"
            : "Ethereum or Polygon mainnet"
        }!`,
        options
      )
    }
  }, [library && library.wallet.network])

  const checkTransactions = () => {
    const { transactions } = state
    Promise.all(
      transactions.map(
        (transaction) =>
          new Promise((resolve) => {
            library.web3.eth
              .getTransactionReceipt(transaction[0])
              .then(() => resolve(transaction[0]))
              .catch(() => resolve(transaction[0]))
          })
      )
    ).then((receipts) => {
      dispatch({
        type: "txHash",
        payload: [receipts.filter((hash) => hash), true],
      })
    })
  }

  useEffect(() => {
    if (!restored && library) {
      setRestored(true)
      checkTransactions()
    }
  }, [library, state.transactions, state.account.address])

  const handleChangeNetwork = async (networkId, networkInfo) => {
    if (window.ethereum) {
      const hexChainId = "0x" + networkId.toString(16)
      const networkInfo = networks[networkId]
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
        })
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  rpcUrl: networkInfo.rpc,
                },
              ],
            })
          } catch (addError) {
            console.error(addError)
          }
        }
        console.error(error)
      }
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert(
        "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
      )
    }
  }

  const toggleBridgeHistory = () => {
    dispatch({
      type: "toggleHistoryModal",
    })
  }

  return (
    <>
      <Head>
        <title>Defenders of Dogewood</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta
          name="apple-mobile-web-app-title"
          content="Defenders of Dogewood"
        />
        <meta name="application-name" content="Defenders of Dogewood" />
        <meta
          name="thumbnail"
          content="https://dogewoodnft.com/feature-meta.png"
        />
        <meta name="title" content="Defenders of Dogewood" />
        <meta
          name="description"
          content="An On-Chain RPG with the metadata and images are generated and stored 100% on-chain. No IPFS. NO API. Just the Ethereum blockchain."
        />
        <link rel="canonical" href="https://dogewoodnft.com" />
        <meta property="og:title" content="Defenders of Dogewood" />
        <meta
          property="og:image"
          content="https://dogewoodnft.com/feature-meta.png"
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="An On-Chain RPG with the metadata and images are generated and stored 100% on-chain. No IPFS. NO API. Just the Ethereum blockchain."
        />
        <meta property="og:url" content="https://dogewoodnft.com" />
        <meta property="og:site_name" content="Defenders of Dogewood" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Defenders of Dogewood" />
        <meta
          property="twitter:description"
          content="An On-Chain RPG with the metadata and images are generated and stored 100% on-chain. No IPFS. NO API. Just the Ethereum blockchain."
        />
        <meta
          property="twitter:image"
          content="https://dogewoodnft.com/feature-meta.png"
        />
        <meta name="twitter:site" content="@dogewoodnft" />
        <meta name="twitter:creator" content="@dogewoodnft" />
        <meta property="twitter:url" content="https://dogewoodnft.com" />
        <meta property="og:title" content="Defenders of Dogewood" />
        <meta name="twitter:title" content="Defenders of Dogewood" />
        <link
          href="https://necolas.github.io/normalize.css/latest/normalize.css"
          rel="stylesheet"
          type="text/css"
        />
        <link rel="preconnect" href="https://fonts.google.com/specimen/Saira" />
        <link href="https://fonts.google.com/specimen/Saira" rel="stylesheet" />
        <link rel="icon" href="/favicon.png" />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-Q8TWS6ZRMY`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q8TWS6ZRMY');
          `,
          }}
        />
      </Head>
      {/* <div className={styles.countdownWrapper}>
        {!isLive && <CountTimeDown onLive={handleLive} />}
      </div> */}
      <main className={`${styles.main}`}>
        <ToastContainer />
        <header className={styles.header}>
          <div className="flex-center justify-between limited">
            <div className="flex-center">
              <img
                src="/assets/menu.svg"
                className={`${styles.hamburger} cursor`}
                alt="menu"
                onClick={() => setIsCollapse(!isCollapse)}
              />
              <Link href="/">
                <img
                  className={`${styles.logo} cursor`}
                  src="/logo.png"
                  alt="Defenders of Dogewood"
                />
              </Link>
            </div>
            <div className={styles.nav_menus}>
              <div className={`flex ${styles.menu}`}>
                <Link href="/">
                  <a
                    className={
                      router?.asPath === "/#game" || router?.asPath === "/"
                        ? styles.active
                        : ""
                    }
                  >
                    {" "}
                    Barracks
                  </a>
                </Link>
              </div>
              <div className={`flex ${styles.menu}`}>
                <Link href="/questing">
                  <a
                    className={
                      router?.asPath != "/#game" &&
                      router?.asPath !== "/" &&
                      !router?.asPath?.includes("commoner") &&
                      !router?.asPath?.includes("inventory")
                        ? styles.active
                        : ""
                    }
                  >
                    Quest
                  </a>
                </Link>
              </div>

              {isPolygon(network) && (
                <div className={`flex ${styles.menu}`}>
                  <Link href="/commoner">
                    <a
                      className={
                        router?.asPath?.includes("commoner")
                          ? styles.active
                          : ""
                      }
                    >
                      Commoner
                    </a>
                  </Link>
                </div>
              )}

              {isPolygon(network) && (
                <div className={`flex ${styles.menu}`}>
                  <Link href="/inventory">
                    <a
                      className={
                        router?.asPath?.includes("inventory")
                          ? styles.active
                          : ""
                      }
                    >
                      Inventory
                    </a>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-center">
              <div className={`flex ${styles.menu} ${styles.networkMenu}`}>
                <NetworkSelector
                  onChangeNetwork={handleChangeNetwork}
                  selectedNetworkId={library?.wallet?.network}
                />
                <div className={styles.bridgeHistory}>
                  <img
                    src="/assets/history.svg"
                    alt="Bridge History"
                    title="Bridge History"
                    onClick={toggleBridgeHistory}
                  />
                </div>
              </div>
              <div className={styles.mobileMenu}>
                <div className={styles.collapseContent} id="collapse-content">
                  <Collapse isOpened={isCollapse}>
                    <div className={`${styles.menuContent} flex-all`}>
                      <Link href="/">Barracks</Link>
                      <Link href="/questing">
                        <div
                          className={
                            router.pathname === "/mint" ? styles.activeMenu : ""
                          }
                        >
                          Questing
                        </div>
                      </Link>
                      {isPolygon(network) && (
                        // <div className={`flex ${styles.menu}`}>
                        <Link href="/commoner">
                          <a
                            className={
                              router?.asPath?.includes("commoner")
                                ? styles.active
                                : ""
                            }
                          >
                            Commoner
                          </a>
                        </Link>
                        // </div>
                      )}

                      {isPolygon(network) && (
                        // <div className={`flex ${styles.menu}`}>
                        <Link href="/inventory">
                          <a
                            className={
                              router?.asPath?.includes("inventory")
                                ? styles.active
                                : ""
                            }
                          >
                            Inventory
                          </a>
                        </Link>
                        // </div>
                      )}
                    </div>
                  </Collapse>
                </div>
              </div>
              <Account
                library={library}
                {...state}
                loading={loading}
                dispatch={dispatch}
                connectWallet={connectWallet}
              />
            </div>
          </div>
        </header>
        {React.cloneElement(children, {
          state,
          dispatch,
          library,
          networks,
          connectWallet,
        })}
        {/* <footer className={styles.footer}>
          <div
            className={`flex-center justify-between limited ${styles.footerContent}`}
          >
            <div className={styles.menuWrapper}>
              <div className={styles.copyRight}>
                <div>Welcome to Dogewood. I love you.</div>
              </div>
            </div>
          </div>
        </footer> */}

        {/* MODALS */}
        {/* <TxModal
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
        /> */}
        {/* <BridgeHistoryModal
          show={state.showBridgeHistory}
          transactions={bridgeTxs}
          onCancel={() => dispatch({ type: "toggleHistoryModal" })}
          onFinalize={handleFinalizeBridgeTx}
        /> */}
      </main>
    </>
  )
}
