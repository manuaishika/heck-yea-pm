// Pure merge rules for the three synced keys. No browser or network imports,
// so they can be tested in plain Node. Each takes (local, remote) and returns
// the merged value.

export const SAVED_KEY = 'hyp.saved.v1'
export const REVIEWS_KEY = 'hyp.reviews.v1'
export const QUIZ_KEY = 'hyp.quiz.v1'

/** Saved question ids: everything from both sides, this device's order first. */
export function mergeSaved(local, remote) {
  const a = Array.isArray(local) ? local.filter((x) => typeof x === 'string') : []
  const b = Array.isArray(remote) ? remote.filter((x) => typeof x === 'string') : []
  return [...new Set([...a, ...b])]
}

/** Flashcard marks by question id. Both sides kept; this device wins a clash. */
export function mergeReviews(local, remote) {
  const ok = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {})
  return { ...ok(remote), ...ok(local) }
}

/** Quiz answers: the more recent attempt wins whole, so a retake is never mixed. */
export function mergeQuiz(local, remote) {
  const at = (q) => (q && typeof q === 'object' && typeof q.at === 'number' ? q.at : 0)
  const has = (q) => q && typeof q === 'object' && q.answers && Object.keys(q.answers).length > 0
  if (!has(remote)) return local
  if (!has(local)) return remote
  return at(remote) > at(local) ? remote : local
}

export const MERGERS = {
  [SAVED_KEY]: mergeSaved,
  [REVIEWS_KEY]: mergeReviews,
  [QUIZ_KEY]: mergeQuiz,
}

export const SYNCED_KEYS = Object.keys(MERGERS)

export const EMPTY = {
  [SAVED_KEY]: [],
  [REVIEWS_KEY]: {},
  [QUIZ_KEY]: { answers: {}, at: 0 },
}

/** Deep equality for the small JSON values we sync. */
export function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}
