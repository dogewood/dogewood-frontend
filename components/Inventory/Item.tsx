import { useEffect, useState } from "react"
import Web3 from "web3"
import styles from "./Inventory.module.scss"
import { BsThreeDotsVertical, BsChevronRight } from "react-icons/bs"
import { toFixed } from "utils/number"
import { toast } from "react-toastify"
import Timer from "components/Timer"

export default function Item({ image, id, name, desc, use, price }) {
  return (
    <div className={styles.top_level_holder}>
      <div className={styles.card}>
        <div className={styles.thumbnail}>
          <img src={image} alt="loot_box" />
        </div>

        <div className={styles.tired_status}>
          <div className={styles.icon}>
            <p>{price}</p>
          </div>
        </div>
      </div>
      {/* ------------------------------------------ */}
      <div className={styles.info_box}>
        <h3>{name}</h3>
        <p>{desc}</p>
        <p className={styles.use}>{use}</p>
      </div>
    </div>
  )
}
