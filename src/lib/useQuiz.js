import { useCallback, useSyncExternalStore } from 'react'
import { readJSON, writeJSON, subscribe, storageAvailable } from './storage'

// Quiz answers, keyed by skill slug so adding a question never wipes existing
// answers. Value: the index of the option the user picked.
// Shape: { answers: { [slug]: number }, at: number } — `at` is the time of the
// last change, used to pick a winner when this is synced across devices.
import { QUIZ_KEY } from './syncMerge'
export { QUIZ_KEY }

const EMPTY = { answers: {}, at: 0 }

let cache = null
const listeners = new Set()

function load() {
  const obj = readJSON(QUIZ_KEY, EMPTY)
  if (!obj || typeof obj !== 'object' || typeof obj.answers !== 'object') return EMPTY
  const answers = {}
  for (const [k, v] of Object.entries(obj.answers || {})) {
    if (Number.isInteger(v) && v >= 0 && v < 10) answers[k] = v
  }
  return { answers, at: typeof obj.at === 'number' ? obj.at : 0 }
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
  const unsub = subscribe(QUIZ_KEY, () => {
    cache = load()
    emit()
  })
  return () => {
    listeners.delete(onChange)
    unsub()
  }
}

function set(next) {
  cache = next
  writeJSON(QUIZ_KEY, next)
  emit()
}

/**
 * @returns {{
 *   answers: Record<string, number>,
 *   answer: (slug: string, optionIndex: number) => void,
 *   reset: () => void,
 *   canPersist: boolean,
 * }}
 */
export function useQuiz() {
  const { answers } = useSyncExternalStore(subscribeStore, getSnapshot, () => EMPTY)

  const answer = useCallback((slug, optionIndex) => {
    const cur = getSnapshot()
    if (slug in cur.answers) return // one attempt per question until retake
    set({ answers: { ...cur.answers, [slug]: optionIndex }, at: Date.now() })
  }, [])

  const reset = useCallback(() => {
    set({ answers: {}, at: Date.now() })
  }, [])

  return { answers, answer, reset, canPersist: storageAvailable }
}
