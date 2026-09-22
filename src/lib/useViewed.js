import { useCallback, useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe } from './storage'

// Which flowchart cards a visitor has opened. Keyed by card id
// ("<skill-slug>.<stage>") so adding a stage or a skill never disturbs
// progress. Signed-in sync hooks in here later — same read/write shape.
const KEY = 'hyp.viewed.v1'

let cache = null
const listeners = new Set()

function load() {
  const obj = readJSON(KEY, {})
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  return obj
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

/**
 * @returns {{ viewed: Record<string, true>, markViewed: (id: string) => void, isViewed: (id: string) => boolean }}
 */
export function useViewed() {
  const viewed = useSyncExternalStore(subscribeStore, getSnapshot, () => ({}))
  const markViewed = useCallback((id) => {
    if (viewed[id]) return
    const next = { ...getSnapshot(), [id]: true }
    cache = next
    writeJSON(KEY, next)
    emit()
  }, [viewed])
  const isViewed = useCallback((id) => Boolean(viewed[id]), [viewed])
  return { viewed, markViewed, isViewed }
}
