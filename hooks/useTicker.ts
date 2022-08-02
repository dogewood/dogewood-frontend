import { useEffect, useState } from 'react'

export function getDuration(start, end) {
  if (start >= end) return false
  let remaining = parseInt(((end - start) / 1000).toString())
  const seconds = `00${remaining % 60}`.slice(-2)
  remaining = (remaining - (remaining % 60)) / 60
  const mins = `00${remaining % 60}`.slice(-2)
  const hours = (remaining - (remaining % 60)) / 60
  if (hours > 72) return `${Math.ceil(hours / 24)} days`
  return `${hours < 10 ? `00${hours}`.slice(-2) : hours}:${mins}:${seconds}`
}

export default function useTicker(interval = 1) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval * 1000)
    return () => timer && clearInterval(timer)
  }, [])

  return [now]
}
