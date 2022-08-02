import { API_ROOT } from './constants'

export const getQuery = async (path) => {
  try {
    const result = await (await fetch(`${API_ROOT}${path}`)).json();

    if (result?.status == 'ok') return { data: result.data };
    if (result?.status == 'error') return { error: result };
    throw ('Unknown error');
  } catch (err) {
    return { error: { status: 'error', message: err.toString() } }
  }
}

export const postQuery = async (path, body) => {
  try {
    const result = await (
      await fetch(`${API_ROOT}${path}`, {
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
    ).json();

    if (result?.status == 'ok') return { data: result.data };
    if (result?.status == 'error') return { error: result };
    throw ('Unknown error');
  } catch (err) {
    return { error: { status: 'error', message: err.toString() } }
  }
}

export const getCall = async (path) => {
  const res = await getQuery(path)
  if (res.error) return null;
  return res.data;
}

export const postCall = async (path, body) => {
  const res = await postQuery(path, body)
  if (res.error) return null;
  return res.data;
}

export const getChildCounter = async () => {
  return Number(await getCall('/api/child_counter'));
}

export const getHistoryByTxs = async (txs) => {
  return await postCall('/api/history', { txs });
}

export const getEthBridgeLogs = async (address) => {
  // return await getCall(`/api/stateSyncedLogs?address=0x77E4F140C21C50eFDD763A9c0da17785EC9dDeB9`)
  return await getCall(`/api/stateSyncedLogs?address=${address}`)
}

export const getPolyBridgeLogs = async (address) => {
  // return await getCall(`/api/history?address=0x77E4F140C21C50eFDD763A9c0da17785EC9dDeB9`)
  return await getCall(`/api/history?address=${address}`)
}

export const getCommonersClaimInfo = async (address) => {
  return await getCall(`/api/commoners/dogesClaimed/${address}`)
}
