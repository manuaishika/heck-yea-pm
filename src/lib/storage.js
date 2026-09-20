// Safe localStorage. Every path degrades to "app works, progress not saved"
// rather than throwing: private browsing, disabled storage, quota full, or
// corrupted JSON all resolve to the fallback.

function available() {
  try {
    const k = '__hyp_probe__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export const storageAvailable = available()

export function readJSON(key, fallback) {
  if (!storageAvailable) return fallback
  let rawValue
  try {
    rawValue = window.localStorage.getItem(key)
  } catch {
    return fallback
  }
  if (rawValue == null) return fallback
  try {
    const parsed = JSON.parse(rawValue)
    return parsed == null ? fallback : parsed
  } catch {
    // corrupted or stale — discard and move on
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    return fallback
  }
}

let writeListener = null

/** Register a callback fired after every successful write (used for cloud sync). */
export function setWriteListener(fn) {
  writeListener = fn
}

/** Returns true on success, false if the write could not be persisted. */
export function writeJSON(key, value) {
  if (!storageAvailable) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    if (writeListener) writeListener(key)
    return true
  } catch {
    // quota exceeded or serialization failure — keep running without persistence
    return false
  }
}

/** Subscribe to changes to `key` made in other tabs. Returns an unsubscribe fn. */
export function subscribe(key, handler) {
  if (typeof window === 'undefined') return () => {}
  function onStorage(e) {
    if (e.key === key || e.key === null) handler()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
