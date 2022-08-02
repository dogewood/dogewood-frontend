import { useEffect, useState } from "react"
import { BiSearchAlt2 } from "react-icons/bi"
import classes from "./Inventory.module.scss"
import Item from "./Item"
import { loot_boxes_data } from "utils/constants"

const Inventory = ({ library }) => {
  const account = library ? library.wallet.address : ""
  const [search, setSearch] = useState("")
  const [prices, setPrices] = useState()
  const filteredItems =
    search && +search
      ? loot_boxes_data.filter((box) => box.id === +search)
      : loot_boxes_data

  // Items.balanceOfBatch([address1,address1,,address1,,address1,,address1,,], [1,2,3,4,5,6,7,8]);

  const getBalanceOfBatch = () => {
    if (library?.methods?.Items) {
      const { balanceOfBatch } = library?.methods?.Items
      const { balanceOf } = library?.methods?.Treat
      if (account && balanceOfBatch) {
        balanceOfBatch(
          [
            account,
            account,
            account,
            account,
            account,
            account,
            account,
            account,
          ],
          [1, 2, 3, 4, 5, 6, 7, 8]
        )
          .then((bals) => {
            setPrices(bals)
          })
          .catch(console.log)
      }
    }
  }
  useEffect(() => {
    getBalanceOfBatch()
  }, [])

  // console.log(account, "account")

  return (
    <div className={classes.inventory_wrapper}>
      <div className={classes.inventory_container}>
        <h1>INVENTORY</h1>
        <div className={classes.row_two}>
          <form className={classes.left}>
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
            <BiSearchAlt2 className={classes.icon} />
          </form>
          <form className={classes.right}>
            <select>
              <option>Type:</option>
            </select>
          </form>
        </div>
        {/* ---------------------------------- */}
        <div className={classes.inventory_collection}>
          {filteredItems.map((box, i) => (
            prices && prices[i] && prices[i] != '0' &&
            <Item
              key={box.id}
              image={box.image}
              id={box.id}
              name={box.name}
              desc={box.desc}
              use={box.use}
              price={prices && prices[i]}
            />
          ))}

          {Array.from(Array(15).keys()).map((n) => (
            <div key={n} className={classes.empty}>
              <div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Inventory
