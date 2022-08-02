import * as EvmChains from 'evm-chains'
import Web3 from 'web3'
import Dogewood from './ABIs/Dogewood.json'
import NameChange from './ABIs/NameChange.json'
import Castle from './ABIs/Castle.json'
import Portal from './ABIs/MainlandPortal.json'
import ERC20 from './ABIs/ERC20.json'
import Battle from './ABIs/Battle.json'
import Quest from './ABIs/Quest.json'
import Items from './ABIs/Items.json'
import Commoners from './ABIs/Commoners.json'

const DEFAULT_REFRESH = 5 * 1000

export const call =
  (method: (...args: any) => any) =>
  (...args: any) => method(...args).call() as Promise<any>

export const send =
  (method: (...args: any) => any) =>
  (...args: any) => {
    const option = args.pop()
    const transaction = method(...args)
    return {
      estimate: (): Promise<any> =>
        transaction.estimateGas(option) as Promise<any>,
      send: (): Promise<any> => transaction.send(option) as Promise<any>,
      transaction,
    }
  }

interface Options {
  readonly onEvent?: (type: string, payload: any, error: any) => void
  readonly addresses: any
}

interface Wallet {
  address?: string
  network?: number
}

class NftLibrary {
  public initiated: boolean
  public web3: Web3
  public contracts: any
  public methods: any
  public addresses: any
  private wallet: Wallet = {}
  private options: any
  private subscriptions: any[] = []
  private timers: NodeJS.Timeout[] = []

  constructor(provider: any, options: Options) {
    this.web3 = new Web3(provider)
    this.options = options
    this.init(provider)
  }

  get onEvent() {
    return this.options.onEvent
  }

  public setProvider(provider: any) {
    this.init(provider)
  }

  public onDisconnect() {
    this.disconnect()
  }

  private reset() {
    this.subscriptions.forEach((subscription) => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe()
      } else if (subscription.deleteProperty) {
        subscription.deleteProperty()
      }
    })
    this.timers.forEach((timer) => clearInterval(timer))
  }

  private async setupWallet() {
    let status = 0 // No updates
    const chainId = await this.web3.eth.getChainId()
    const { networkId: network } = await EvmChains.getChain(chainId)
    const [address] = await this.web3.eth.getAccounts()
    if (this.wallet.address && !address) {
      return this.disconnect()
    } else if (this.wallet.network && this.wallet.network !== network) {
      status = 1
    } else if (this.wallet.address !== address) {
      status = 2
    }
    this.wallet.network = network
    this.wallet.address = address
    if (this.wallet.network) {
      this.addresses = this.options.addresses[this.wallet.network]
    }
    return status
  }

  private async initWallet(refresh: boolean = false) {
    const status = await this.setupWallet()
    if (refresh || status > 0) {
      this.onEvent({
        data: [this.wallet],
        event: 'WALLET',
        status,
      })
    }
  }

  private connect() {
    this.initWallet(true)
  }

  private disconnect() {
    if (this.web3.givenProvider && this.web3.givenProvider.disconnect) {
      this.web3.givenProvider.disconnect()
    }
    delete this.wallet.address
    this.reset()
    this.onEvent({
      event: 'WALLET',
      status: 3,
    })
  }

  private async init(givenProvider?: any) {
    this.initiated = false
    if (givenProvider) {
      this.web3 = new Web3(givenProvider)
    }
    const provider = givenProvider || this.web3.givenProvider
    this.reset()
    const status = await this.setupWallet()
    const { addresses, onEvent } = this
    this.subscriptions = [
      provider.on && provider.on('accountsChanged', () => this.initWallet()),
      provider.on && provider.on('chainChanged', () => this.init()),
      provider.on && provider.on('connect', () => this.connect()),
      provider.on && provider.on('disconnect', () => this.disconnect()),
    ].filter((item) => !!item)

    if (addresses) {
      this.contracts = {
        Dogewood: new this.web3.eth.Contract(Dogewood as any, addresses.Dogewood),
        Treat: new this.web3.eth.Contract(ERC20 as any, addresses.Treat),
        Weth: new this.web3.eth.Contract(ERC20 as any, addresses.Weth),
        Portal: new this.web3.eth.Contract(Portal as any, addresses.Portal),
        Castle: new this.web3.eth.Contract(Castle as any, addresses.Castle),
        NameChange: new this.web3.eth.Contract(NameChange as any, addresses.NameChange),
        Battle: new this.web3.eth.Contract(Battle as any, addresses.Battle),
        Quest: new this.web3.eth.Contract(Quest as any, addresses.Quest),
        Items: new this.web3.eth.Contract(Items as any, addresses.Items),
        Commoners: new this.web3.eth.Contract(Commoners as any, addresses.Commoners),
      }

      this.timers = [
        setInterval(
          () => this.initWallet(),
          this.options.interval || DEFAULT_REFRESH
        ),
      ]

      this.methods = {
        Dogewood: {
          totalSupply: call(this.contracts.Dogewood.methods.totalSupply),
          presaleMintWithEth: send(this.contracts.Dogewood.methods.presaleMintWithEth),
          mintWithEth: send(this.contracts.Dogewood.methods.mintWithEth),
          tokenURI: call(this.contracts.Dogewood.methods.tokenURI),
          doAction: send(this.contracts.Dogewood.methods.doAction),
          doActionWithManyDoges: send(this.contracts.Dogewood.methods.doActionWithManyDoges),
          claim: send(this.contracts.Dogewood.methods.claim),
          recruit: send(this.contracts.Dogewood.methods.recruit),
          changeName: send(this.contracts.Dogewood.methods.changeName),
          changeArtStyle: send(this.contracts.Dogewood.methods.changeArtStyle),
          upgradeLevelWithTreat: send(this.contracts.Dogewood.methods.upgradeLevelWithTreat),
          upgradeMultipleLevelWithTreat: send(this.contracts.Dogewood.methods.upgradeMultipleLevelWithTreat),
          rerollWithTreat: send(this.contracts.Dogewood.methods.rerollWithTreat),
          approve: send(this.contracts.Dogewood.methods.approve),
          setApproveForAll: send(this.contracts.Dogewood.methods.setApproveForAll),
          isApprovedForAll: call(this.contracts.Dogewood.methods.isApprovedForAll),
          claimable: call(this.contracts.Dogewood.methods.claimable),
          rerollPrice: call(this.contracts.Dogewood.methods.rerollPrice),
          upgradeLevelPrice: call(this.contracts.Dogewood.methods.upgradeLevelPrice),
          rerollCountHistory: call(this.contracts.Dogewood.methods.rerollCountHistory),
          mintLogs: call(this.contracts.Dogewood.methods.mintLogs),
          activities: call(this.contracts.Dogewood.methods.activities),
          ownerOf: call(this.contracts.Dogewood.methods.ownerOf),
          balanceOf: call(this.contracts.Dogewood.methods.balanceOf),
          artStyles: call(this.contracts.Dogewood.methods.artStyles),
          questCooldownLogs: call(this.contracts.Dogewood.methods.questCooldownLogs),
        },
        Treat: {
          balanceOf: call(this.contracts.Treat.methods.balanceOf),
          allowance: call(this.contracts.Treat.methods.allowance),
          totalSupply: call(this.contracts.Treat.methods.totalSupply),
          approve: send(this.contracts.Treat.methods.approve),
        },
        Weth: {
          balanceOf: call(this.contracts.Weth.methods.balanceOf),
          allowance: call(this.contracts.Weth.methods.allowance),
          totalSupply: call(this.contracts.Weth.methods.totalSupply),
          approve: send(this.contracts.Weth.methods.approve),
        },
        Castle: {
          travel: send(this.contracts.Castle.methods.travel)
        },
        Portal: {
          receiveMessage: send(this.contracts.Portal.methods.receiveMessage)
        },
        NameChange: {
          tokenNameByIndex: call(this.contracts.NameChange.methods.tokenNameByIndex),
          isNameReserved: call(this.contracts.NameChange.methods.isNameReserved),
          validateName: call(this.contracts.NameChange.methods.validateName),
        },
        Battle: {
          combatSingle: send(this.contracts.Battle.methods.combatSingle),
          _dogeLastScore: call(this.contracts.Battle.methods._dogeLastScore),
        },
        Quest: {
          getDogeEntryFee: call(this.contracts.Quest.methods.getDogeEntryFee),
          prizePool: call(this.contracts.Quest.methods.prizePool),
          getScore: call(this.contracts.Quest.methods.getScore),
        },
        Items: {
          balanceOf: call(this.contracts.Items.methods.balanceOf),
          balanceOfDecimals: call(this.contracts.Items.methods.balanceOfDecimals),
          balanceOfBatch: call(this.contracts.Items.methods.balanceOfBatch),
        },
        Commoners: {
          balanceOf: call(this.contracts.Commoners.methods.balanceOf),
          totalSupply: call(this.contracts.Commoners.methods.totalSupply),
          publicMint: send(this.contracts.Commoners.methods.publicMint),
        },
        web3: {
          getBlock: (field: string = 'timestamp') =>
            new Promise((resolve, reject) =>
              this.web3.eth
                .getBlock('latest')
                .then((block: any) => {
                  if (field) {
                    resolve(block[field])
                  } else {
                    resolve(block)
                  }
                })
                .catch(reject)
            ),
        },
      }
    }

    this.onEvent({
      data: [this.wallet],
      event: 'WALLET',
      status,
    })
    this.initiated = true
  }
}

export default NftLibrary
