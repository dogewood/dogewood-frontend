import BigNumber from 'bignumber.js'

const abbreviateNumberFactory = (symbols) => (
  number,
  minDigits,
  maxDigits,
  decimals = 18
) => {
  if (number === 0) return number
  if (number < 1) return new BigNumber(number).dp(maxDigits, 1).toString()

  // determines SI symbol
  const tier = Math.floor(Math.log10(Math.abs(number)) / 3)

  // get suffix and determine scale
  const suffix = symbols[tier] === undefined ? `e${tier * 3}` : symbols[tier]
  const scale = 10 ** (tier * 3)

  // scale the number
  const scaled = number / scale

  // format number and add suffix
  return (
    scaled.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }) + suffix
  )
}

const SI_SYMBOLS = ['', 'k', 'M', 'G', 'T', 'P', 'E']

export const abbreviateNumberSI = abbreviateNumberFactory(SI_SYMBOLS)

export const toFixed = (number, decimals, string = false) => {
  const value = new BigNumber(new BigNumber(number).toFixed(decimals, 1))
  return string ? value : value.toNumber()
}
