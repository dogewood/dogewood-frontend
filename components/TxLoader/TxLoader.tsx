import Button from 'components/Button/Button'
import { getEtherscan } from 'utils/links'
import styles from './TxLoader.module.css'

interface ITxLoader {
  hash?: string
  network?: number
}

export const scanLabels = {
  1: 'Etherscan',
  4: 'Etherscan',
  5: 'Etherscan',
  137: 'PolygonScan',
  80001: 'MumbaiScan',
}

export default function TxLoader({ hash, network }: ITxLoader) {
  const text = hash ? 'Transaction pending...' : 'Waiting confirmation...'
  return (
    <div className={styles.loader}>
      <p>{text}</p>
      <img src="/assets/loading.gif" />
      {hash && <Button href={getEtherscan(hash, network)} className="padded">View on {scanLabels[network] || 'Scan'}</Button>}
    </div>
  )
}
