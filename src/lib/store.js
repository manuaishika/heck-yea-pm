import { useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe } from './storage'

/**
 * A small localStorage-backed store for React: read through a cache, write
 * through to storage, and tell every subscriber (including other tabs).
 * `clean` repairs whatever is on disk so a corrupted value cannot break a page.
 */
export function createStore(key, empty, clean = (x) => x) {
  let cache = null
  const listeners = new Set()
  const load = () => clean(readJSON(key, empty))
  const get = () => (cache ??= load())
  const emit = () => listeners.forEach((l) => l())
  return {
    empty,
    get,
    set(next) {
      cache = next
      writeJSON(key, next)
      emit()
    },
    subscribe(onChange) {
      listeners.add(onChange)
      const off = subscribe(key, () => {
        cache = load()
        emit()
      })
      return () => {
        listeners.delete(onChange)
        off()
      }
    },
  }
}

export const useStore = (store) => useSyncExternalStore(store.subscribe, store.get, () => store.empty)
