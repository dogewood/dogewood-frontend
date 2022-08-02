export function toNumber(value, decimal = 12) {
  const regex = new RegExp(`^-?\\d+(?:\\.\\d{0,${decimal}})?`)
  const val = Number(value.toString().match(regex)[0])
  return val < 0.1 ** Math.max(decimal - 5, 2) ? 0 : val
}

export const getWalletAddressEllipsis = (address, head = 6, tail = 4) => {
  return `${address.substring(0, head)}...${address.substring(
    address.length - tail
  )}`;
};


// fetch average gas value
export const fetchAverageGas = async() => {
  try {
    const fetchA = await fetch(
      "https://ethgasstation.info/api/ethgasAPI.json?api-key=4940cb7a6fe8608f109c208e9c89049b401bbaef37083a0a9bddbf0ba16b"
    )
    return await fetchA.json()
  }
  catch(err) {
    throw new Error(err)
  }
}
