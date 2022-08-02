import { useState } from "react"
import Web3 from "web3"
import styles from "./Barracks.module.css"
import { BsThreeDotsVertical, BsChevronRight } from "react-icons/bs"
import { toFixed } from "utils/number"
import OutsideClickHandler from "react-outside-click-handler"
import toast from "react-hot-toast"

export default function Defender({
  token,
  userInfo,
  onStake,
  onUnstake,
  onClaim,
  onLevelUp,
  onReroll,
  onRecruit,
  onBridge,
  onRename,
  onChangeArt,
  handleDefenderSelect,
  isPolygon,
  tired,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)

  const [tiredTimestamp, setTiredTimestamp] = useState(0)
  tired &&
    tired.then((t) => {
      if (t != 0) {
        setTiredTimestamp(Number(t))
      }
    })

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
  const isQuestCooldownLocked =
    currentTime <=
    new Date((Number(tiredTimestamp) + 24 * 3600) * 1000).getTime()

  const [selected, setSelected] = useState(false)
  const hideMenu = () => {
    setShowMenu(false)
    setShowSubMenu(false)
    return true
  }

  // console.log(filteredAttributes, "test values")

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setShowMenu(false)
        setShowSubMenu(false)
      }}
    >
      <div className={styles.top_level_holder}>
        {isQuestCooldownLocked && (
          <div className={styles.tired_status}>
            <div className={styles.icon}>
              <img src="/icons/tired.svg" alt="" />
            </div>
            <div className={styles.info_box}>
              <h3>Tired</h3>
              <p>
                {`This Doge is tired from questing. To stake, you should wait until ${new Date(
                  (Number(tiredTimestamp) + 24 * 3600) * 1000
                ).toLocaleString()}`}
              </p>
              <p>{/* <Timer /> */}</p>
            </div>
          </div>
        )}
        <div
          className={selected == true ? styles.selected_card : styles.card}
          onClick={() => {
            handleDefenderSelect(
              token?.tokenId,
              token?.tokenURI?.attributes[7]?.value
            )
            setSelected(!selected)
          }}
        >
          {isStaked && <span className={styles.badge}>Staked</span>}
          <div className={styles.thumbnail}>
            <img src={token?.tokenURI?.image} alt={token?.tokenURI?.name} />
          </div>
          <p className={styles.text1}>{token?.tokenURI?.name}</p>
          {isPolygon && (
            <p className={styles.text2}>{token?.name || "No name"}</p>
          )}
          <p className={styles.text3}>
            {toFixed(Web3.utils.fromWei(token?.claimable), 4)} $Treat Available
          </p>
          <div className={styles.traits}>
            {filteredAttributes.map(({ trait_type, value }) => (
              <div className={styles.traitType} key={trait_type}>
                <div className={styles.traitTypeLabel}>{trait_type}</div>
                <div className={styles.traitTypeValue}>{value}</div>
              </div>
            ))}
          </div>
          {/* {(isOwner || isStaked) && <BsThreeDotsVertical className={styles.threedots} onClick={() => setShowMenu(!showMenu)}/>} */}
          {/* Menu on card  "absolute element"*/}
        </div>
        {(isOwner || isStaked) && (
          <BsThreeDotsVertical
            className={styles.threedots}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              color: "#fff",
            }}
            onClick={() => setShowMenu(!showMenu)}
          />
        )}

        {showMenu && (
          <div className={styles.card_options}>
            <ul>
              {isOwner && !isStaked ? (
                <li
                  onClick={() => {
                    if (filteredAttributes[4]?.value < 20) {
                      toast.error("You must be level 20 to stake", {
                        position: "bottom-right",
                      })
                      return
                    }

                    !isQuestCooldownLocked &&
                      hideMenu() &&
                      onStake &&
                      onStake(token)
                  }}
                  className={
                    !!isQuestCooldownLocked ? styles.menuItemDisabled : ""
                  }
                >
                  Stake
                </li>
              ) : (
                <li
                  onClick={() => {
                    hideMenu()
                    onUnstake && onUnstake(token)
                  }}
                >
                  Unstake
                </li>
              )}
              <li
                onClick={() => {
                  hideMenu()
                  onClaim && onClaim(token)
                }}
              >
                Claim
              </li>
              <li
                onClick={() =>
                  !isLocked &&
                  onLevelUp &&
                  hideMenu() &&
                  onLevelUp(token, traits?.level)
                }
                className={!!isLocked ? styles.menuItemDisabled : ""}
              >
                Level Up
              </li>
              <li
                onClick={() => {
                  hideMenu()
                  !isLocked && onRecruit && onRecruit(token)
                }}
                className={!!isLocked ? styles.menuItemDisabled : ""}
              >
                Recruit
              </li>
              {isPolygon && (
                <li
                  onClick={() => {
                    hideMenu()
                    onRename && onRename(token)
                  }}
                >
                  Rename
                </li>
              )}
              <li
                className={`${styles.sub_menu} ${
                  isLocked ? styles.menuItemDisabled : ""
                }`}
                onClick={() => !isLocked && setShowSubMenu(!showSubMenu)}
              >
                Reroll{" "}
                <BsChevronRight
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                {showSubMenu && (
                  <ul>
                    <li
                      onClick={() => {
                        hideMenu()
                        onReroll && onReroll(token, 0)
                      }}
                    >
                      Breed ({token?.rerollBreedCount})
                    </li>
                    <li
                      onClick={() => {
                        hideMenu()
                        onReroll && onReroll(token, 1)
                      }}
                    >
                      Class ({token?.rerollClassCount})
                    </li>
                  </ul>
                )}
              </li>
              <li
                onClick={() => {
                  hideMenu()
                  onBridge && onBridge([token.tokenId], 0)
                }}
              >
                Bridge
              </li>
              <li
                onClick={() => {
                  hideMenu()
                  onChangeArt && onChangeArt(token)
                }}
              >
                Change art
              </li>
            </ul>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  )
}
