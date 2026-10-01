import { useCallback, useEffect, useSyncExternalStore } from 'react'

// The theme lives on <html data-theme="light|dark">, set before first paint
// by the inline script in index.html. This hook reads it, changes it, and
// remembers an explicit choice; with no saved choice it follows the system.
const KEY = 'pp.theme'
const listeners = new Set()

const read = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  listeners.forEach((l) => l())
}

function saved() {
  try {
    const t = window.localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => 'light'
  )

  // no saved choice: track the system setting as it changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => {
      if (!saved()) apply(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next) => {
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      /* private mode: the choice just won't outlive the tab */
    }
    apply(next)
  }, [])

  return [theme, setTheme]
}
