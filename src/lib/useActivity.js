import { useCallback, useMemo } from 'react'
import { useViewed } from './useViewed'

// Practice days. One `day.YYYY-MM-DD` id per local day with any practice in
// it, kept in the same store as the flowchart marks (useViewed) so streaks
// sync across devices with no new table.

const PREFIX = 'day.'

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole days since 1970 for a local calendar day — the same for everyone on that date. */
export function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
}

function shift(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + days)
  return d
}

/** Consecutive practice days ending today, or yesterday while today is still open. */
export function streakFrom(days, today = new Date()) {
  let cursor = days.has(dayKey(today)) ? today : shift(today, -1)
  let n = 0
  while (days.has(dayKey(cursor))) {
    n += 1
    cursor = shift(cursor, -1)
  }
  return n
}

/** Monday to Sunday of the week containing `today`, each with its done flag. */
export function weekFrom(days, today = new Date()) {
  const monday = shift(today, -((today.getDay() + 6) % 7))
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, i) => {
    const date = shift(monday, i)
    const key = dayKey(date)
    return { letter, key, done: days.has(key), today: key === dayKey(today) }
  })
}

/**
 * @returns {{
 *   streak: number,
 *   doneToday: boolean,
 *   week: { letter: string, key: string, done: boolean, today: boolean }[],
 *   log: () => void,   // count today as a practice day
 * }}
 */
export function useActivity() {
  const { viewed, markViewed } = useViewed()
  const days = useMemo(
    () => new Set(Object.keys(viewed).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length))),
    [viewed]
  )
  const log = useCallback(() => markViewed(PREFIX + dayKey()), [markViewed])
  const now = new Date()
  return { streak: streakFrom(days, now), doneToday: days.has(dayKey(now)), week: weekFrom(days, now), log }
}
