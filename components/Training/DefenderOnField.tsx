import { useState } from "react"
import Web3 from "web3"
import styles from "./TrainingPage.module.scss"
import { BsThreeDotsVertical, BsChevronRight } from "react-icons/bs"
import { toFixed } from "utils/number"
import { classIcons } from "./Defender_round"

export default function DefenderOnField({
  token,
  userInfo,
  // onStake,
  // onUnstake,
  // onClaim,
  // onLevelUp,
  // onReroll,
  // onRecruit,
  // onBridge,
  // onRename,
  // onChangeArt,
  // handleDefenderSelect,
  // isPolygon,
  emptyPlayground,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)

  // console.log(token, userInfo, "user Info")

  const traits = token?.tokenURI?.attributes?.reduce(
    (prev, curr) => ({ ...prev, [curr.trait_type]: curr.value }),
    {}
  )

  const isOwner = token?.ownerOf === userInfo?.address
  const isStaked =
    token?.activities?.action === "1" &&
    token?.activities?.owner === userInfo?.address

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

  const coolDownTime = new Date(
    (Number(token?.mintLogs?.timestamp) + 12 * 3600) * 1000
  )
  const currentTime = Date.now()
  const isLocked = currentTime <= coolDownTime.getTime()

  const [selected, setSelected] = useState(false)
  const hideMenu = () => {
    setShowMenu(false)
    setShowSubMenu(false)
    return true
  }

  const levelLabel = token?.tokenURI?.attributes?.map(
    ({ trait_type, value }) => {
      return trait_type === "level" && value
    }
  )
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
    <div className={styles.defender_on_field}>
      <span className={styles.add_btn}>
        <p>1</p>
      </span>
      <div
        className={styles.card}
        // onClick={() => {
        //   handleDefenderSelect(token?.tokenId)
        //   setSelected(!selected)
        // }}
      >
        {/* {isStaked && <span className={styles.badge}>Staked</span>} */}
        <div className={styles.thumbnail} onClick={() => emptyPlayground()}>
          <img src={token?.tokenURI?.image} alt={token?.tokenURI?.name} />
          <div className={styles.image_circle}></div>
        </div>
        <div className={styles.thumbnail_label}>
          <div className={styles.label_top}>
            {/* <img
              src={classIcons[token?.tokenURI?.attributes[3]?.value]}
              alt=""
            /> */}
            <p>{token?.name || "No Name"}</p>
          </div>
          <p className={styles.label_bottom}>
            Lv {levelLabel} {breedLabel} {classLabel}
          </p>
        </div>
      </div>
      <div></div>
    </div>
  )
}
