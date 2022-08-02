import { useEffect, useState } from "react"
import Web3 from "web3"
import styles from "./TrainingPage.module.scss"
import { BsThreeDotsVertical, BsChevronRight } from "react-icons/bs"
import { toFixed } from "utils/number"
import { toast } from "react-toastify"
import Timer from "components/Timer"

export const classIcons = {
  Warrior: "/bg/Frame 115.png",
  Rogue: "/bg/Frame 120.png",
  Mage: "/bg/Frame 121.png",
  Hunter: "/bg/Frame 122.png",
  Cleric: "/bg/Frame 123.png",
  Bard: "/bg/Frame 124.png",
  Merchant: "/bg/Frame 125.png",
  Forager: "/bg/Frame 126.png",
}

export default function Defender_round({
  token,
  // userInfo,
  // onStake,
  // onUnstake,
  // onClaim,
  // onLevelUp,
  // onReroll,
  // onRecruit,
  // onBridge,
  // onRename,
  // onChangeArt,
  handleDefenderSelect,
  // isPolygon,
  // isDefenderinField,
  // setWarriorInGround,
  selected,
  tired,
}) {
  const filteredAttributes = token?.tokenURI?.attributes.filter(
    ({ trait_type, value }) => {
      return [
        "armor",
        "offhand",
        "mainhand",
        "Reroll Breed Count",
        "Reroll Class Count",
        "art",
      ].includes(trait_type)
        ? false
        : true
    }
  )
  const [tiredStatus, setTiredStatus] = useState(false)
  tired &&
    tired.then((t) => {
      if (t != 0) {
        setTiredStatus(true)
      }
    })

  const coolDownTime = new Date(
    (Number(token?.mintLogs?.timestamp) + 12 * 3600) * 1000
  )
  const currentTime = Date.now()
  const isLocked = currentTime <= coolDownTime.getTime()

  const breedLabel = token?.tokenURI?.attributes?.map(
    ({ trait_type, value }) => {
      return trait_type === "breed" && value
    }
  )
  const classLabel = token?.tokenURI?.attributes?.map(
    ({ trait_type, value }) => {
      return trait_type === "class" && value
    }
  )

  return (
    <div className={styles.top_level_holder}>
      <div
        className={selected == true ? styles.selected_card : styles.card}
        onClick={() => {
          if (tiredStatus) {
            return
          }
          handleDefenderSelect(token?.tokenId)
        }}
      >
        <div className={styles.thumbnail}>
          <img src={token?.tokenURI?.image} alt={token?.tokenURI?.name} />
        </div>

        <div className={styles.traits}>
          {filteredAttributes?.map(({ trait_type, value }) => {
            return (
              trait_type === "level" && (
                <div className={styles.traitType} key={trait_type}>
                  <div className={styles.traitTypeLabel}>Lv</div>
                  <div className={styles.traitTypeValue}>{value}</div>
                </div>
              )
            )
          })}
        </div>
        {/* <div className={styles.traits_class}>
          {filteredAttributes.map(({ trait_type, value }) => {
            return (
              trait_type === "class" && (
                <div className={styles.traitType} key={trait_type}>
                  <img src={classIcons[value]} alt="" />
                </div>
              )
            )
          })}
        </div> */}

        {tiredStatus && (
          <div className={styles.tired_status}>
            <div className={styles.icon}>
              <img src="/icons/tired.svg" alt="" />
            </div>
            <div className={styles.info_box}>
              <h3>Tired</h3>
              <p>
                {`This Doge is tired from questing. To use it again today, you’ll
                need to spend $TREAT or wait`}
              </p>
              <p>
                <Timer />
              </p>
            </div>
          </div>
        )}
      </div>
      <div className={styles.name}>
        <p>{token?.name || "No Name"}</p>
        <span>
          {breedLabel} {classLabel}
        </span>
      </div>
    </div>
  )
}
