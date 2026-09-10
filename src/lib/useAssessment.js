import { useCallback, useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe, storageAvailable } from './storage'

// Self-assessment ratings, keyed by skill slug so adding a skill never wipes
// existing answers. Value: 0 shaky, 1 okay, 2 solid.
const KEY = 'hyp.assess.v1'

export const RATINGS = [
  { value: 0, label: 'Shaky' },
  { value: 1, label: 'Okay' },
  { value: 2, label: 'Solid' },
]

let cache = null
const listeners = new Set()

function load() {
  const obj = readJSON(KEY, {})
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  const clean = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === 0 || v === 1 || v === 2) clean[k] = v
  }
  return clean
}

function getSnapshot() {
  if (cache === null) cache = load()
  return cache
}

function subscribeStore(onChange) {
  listeners.add(onChange)
  const unsub = subscribe(KEY, () => {
    cache = load()
    for (const l of listeners) l()
  })
  return () => {
    listeners.delete(onChange)
    unsub()
  }
}

/**
 * @returns {{
 *   ratings: Record<string, 0|1|2>,
 *   rate: (slug: string, value: 0|1|2) => void,
 *   reset: () => void,
 *   canPersist: boolean,
 * }}
 */
export function useAssessment() {
  const ratings = useSyncExternalStore(subscribeStore, getSnapshot, () => ({}))

  const rate = useCallback((slug, value) => {
    const next = { ...getSnapshot(), [slug]: value }
    cache = next
    writeJSON(KEY, next)
    for (const l of listeners) l()
  }, [])

  const reset = useCallback(() => {
    cache = {}
    writeJSON(KEY, {})
    for (const l of listeners) l()
  }, [])

  return { ratings, rate, reset, canPersist: storageAvailable }
}
