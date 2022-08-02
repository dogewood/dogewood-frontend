import { ReactNode, ReactNodeArray, useEffect } from 'react'
import styles from './Table.module.css'

interface Properties {
  [key: string]: string
}

interface ITable {
  children: ReactNode | ReactNodeArray
  labels?: Properties
  classes?: Properties
  noBorder?: Boolean
  onLoad?: Function
}

export default function Table({
  children,
  classes = {},
  labels,
  noBorder,
  onLoad,
}: ITable) {

  useEffect(() => {
    onLoad && onLoad()
  }, [])

  return (
    <div
      className={`${styles.table} ${classes.title === 'second' ? `${styles.second}` : ``} ${classes.title === 'first' ? `${styles.first}` : ``} ${classes.table || ''}`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {labels && labels.title && (
        <div className={`${styles.tableTitle} bold`}>
          {labels.title}
        </div>
      )}
      <div className={`${styles.tableContent} ${noBorder ? styles.noBorder : ''} ${classes.content ? classes.content : ''}`}>
        {children}
      </div>
    </div>
  )
}
