import { useCallback, useSyncExternalStore } from 'react'
import { getQuestion } from '../data/questions'

// The active session lives in sessionStorage so a reload mid-session keeps
// your place. It's per-tab, so two tabs run independent sessions — which is
// fine; the persistent marks in localStorage are what actually matter.
const KEY = 'hyp.session.v1'
const LAST_KEY = 'hyp.session.last.v1'

let cache
const listeners = new Set()

function readIds(value) {
  return Array.isArray(value)
    ? value.filter((id) => typeof id === 'string' && getQuestion(id))
    : []
}

function read() {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const ids = readIds(parsed?.ids)
    if (ids.length === 0) return null
    const i = Number.isInteger(parsed?.i)
      ? Math.min(Math.max(parsed.i, 0), ids.length - 1)
      : 0
    return { ids, i }
  } catch {
    return null
  }
}

function getSnapshot() {
  if (cache === undefined) cache = read()
  return cache
}

function emit() {
  for (const l of listeners) l()
}

function subscribe(onChange) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function commit(next) {
  cache = next
  try {
    if (next) window.sessionStorage.setItem(KEY, JSON.stringify(next))
    else window.sessionStorage.removeItem(KEY)
  } catch {
    /* session still works in memory if storage is blocked */
  }
  emit()
}

/** The deck of the session that just finished — for the completion screen. */
export function readLastSession() {
  try {
    const raw = window.sessionStorage.getItem(LAST_KEY)
    const ids = readIds(JSON.parse(raw || '[]'))
    return ids.length ? ids : null
  } catch {
    return null
  }
}

export function useFlashcardSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const start = useCallback((ids) => {
    if (!ids || ids.length === 0) return
    commit({ ids: [...ids], i: 0 })
  }, [])

  const go = useCallback((delta) => {
    const s = getSnapshot()
    if (!s) return
    const i = Math.min(Math.max(s.i + delta, 0), s.ids.length - 1)
    if (i !== s.i) commit({ ...s, i })
  }, [])

  const finish = useCallback(() => {
    const s = getSnapshot()
    try {
      window.sessionStorage.setItem(LAST_KEY, JSON.stringify(s ? s.ids : []))
    } catch {
      /* ignore */
    }
    commit(null)
  }, [])

  const cancel = useCallback(() => commit(null), [])

  return {
    session,
    start,
    finish,
    cancel,
    next: () => go(1),
    prev: () => go(-1),
  }
}
