import { useCallback, useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe, storageAvailable } from './storage'

// Persistent per-card marks: "known" or "review". Keyed by question id so
// adding questions never disturbs progress. Versioned for future migration.
const KEY = 'hyp.reviews.v1'
const VALID = new Set(['known', 'review'])

let cache = null
const listeners = new Set()

function load() {
  const obj = readJSON(KEY, {})
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  const clean = {}
  for (const [k, v] of Object.entries(obj)) if (VALID.has(v)) clean[k] = v
  return clean
}

function getSnapshot() {
  if (cache === null) cache = load()
  return cache
}

function emit() {
  for (const l of listeners) l()
}

function subscribeStore(onChange) {
  listeners.add(onChange)
  const unsub = subscribe(KEY, () => {
    cache = load()
    emit()
  })
  return () => {
    listeners.delete(onChange)
    unsub()
  }
}

function write(next) {
  cache = next
  writeJSON(KEY, next)
  emit()
}

/**
 * @returns {{
 *   marks: Record<string, 'known'|'review'>,
 *   mark: (id: string, status: 'known'|'review') => void,
 *   unmark: (id: string) => void,
 *   clearAll: () => void,
 *   canPersist: boolean,
 * }}
 */
export function useReviews() {
  const marks = useSyncExternalStore(subscribeStore, getSnapshot, () => ({}))

  const mark = useCallback((id, status) => {
    write({ ...getSnapshot(), [id]: status })
  }, [])

  const unmark = useCallback((id) => {
    const next = { ...getSnapshot() }
    delete next[id]
    write(next)
  }, [])

  const clearAll = useCallback(() => write({}), [])

  return { marks, mark, unmark, clearAll, canPersist: storageAvailable }
}

/** Non-hook read, for computing a session deck outside React state. */
export function readReviews() {
  return getSnapshot()
}
