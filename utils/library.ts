export function getNFTInfo(library, dispatch) {
  if (!library || !library.methods) {
    return null
  }
  const { totalSupply } = library.methods.Dogewood
  // const account = library.wallet.address
  Promise.all([
    totalSupply(),
  ])
    .then((infos) => {
      const _totalSupply = infos[0]
      dispatch({
        type: 'nftInfo',
        payload: {
          totalSupply: +_totalSupply,
        },
      })
    })
    .catch((err) => console.log('getNFTInfo', err))
}
