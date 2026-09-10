import { useCallback, useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe, storageAvailable } from './storage'

// Bookmarked questions. Keyed by question id so adding questions never
// disturbs an existing list. Versioned so a future format change can migrate.
const KEY = 'hyp.saved.v1'

let cache = null
const listeners = new Set()

function load() {
  const arr = readJSON(KEY, [])
  return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
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

function setIds(next) {
  cache = next
  writeJSON(KEY, next)
  emit()
}

/**
 * @returns {{
 *   savedIds: string[],
 *   isSaved: (id: string) => boolean,
 *   toggleSave: (id: string) => void,
 *   count: number,
 *   canPersist: boolean,
 * }}
 */
export function useSaved() {
  const savedIds = useSyncExternalStore(subscribeStore, getSnapshot, () => [])

  const toggleSave = useCallback((id) => {
    const current = getSnapshot()
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current]
    setIds(next)
  }, [])

  const isSaved = useCallback((id) => getSnapshot().includes(id), [])

  return {
    savedIds,
    isSaved,
    toggleSave,
    count: savedIds.length,
    canPersist: storageAvailable,
  }
}
