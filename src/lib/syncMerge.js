// Pure merge rules for the local<->cloud sync. No browser or network imports,
// so they can be tested in plain Node.
//
// The cloud table (user_progress) is row-per-item; localStorage stays
// blob-per-key (one JSON object per feature). These functions translate
// between the two shapes and decide, for one local key, which rows the
// cloud needs and what the merged local value should be.

export const SAVED_KEY = 'hyp.saved.v1'
export const REVIEWS_KEY = 'hyp.reviews.v1'
export const VIEWED_KEY = 'hyp.viewed.v1'
export const QUIZ_KEY = 'hyp.quiz.v1'

export const SYNCED_KEYS = [SAVED_KEY, REVIEWS_KEY, VIEWED_KEY, QUIZ_KEY]

export const EMPTY = {
  [SAVED_KEY]: [],
  [REVIEWS_KEY]: {},
  [VIEWED_KEY]: {},
  [QUIZ_KEY]: { answers: {}, at: 0 },
}

/** The item_type a local key maps to in user_progress. */
export const ITEM_TYPE = {
  [SAVED_KEY]: 'saved',
  [REVIEWS_KEY]: 'flashcard',
  [VIEWED_KEY]: 'flow-step',
  [QUIZ_KEY]: 'quiz',
}

/** Deep equality for the small JSON values we sync. */
export function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * local[key] -> the rows user_progress should hold for that item_type, so a
 * local write can be pushed as row upserts.
 * @returns {{ item_id: string, status: string }[]}
 */
export function toRows(key, value) {
  if (key === SAVED_KEY) {
    const ids = Array.isArray(value) ? value.filter((x) => typeof x === 'string') : []
    return ids.map((id) => ({ item_id: id, status: 'saved' }))
  }
  if (key === REVIEWS_KEY) {
    const obj = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return Object.entries(obj)
      .filter(([, v]) => v === 'known' || v === 'review')
      .map(([id, status]) => ({ item_id: id, status }))
  }
  if (key === VIEWED_KEY) {
    const obj = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return Object.keys(obj).map((id) => ({ item_id: id, status: 'viewed' }))
  }
  if (key === QUIZ_KEY) {
    const q = value && typeof value === 'object' ? value : { answers: {}, at: 0 }
    if (!q.answers || Object.keys(q.answers).length === 0) return []
    return [{ item_id: 'result', status: JSON.stringify({ answers: q.answers, at: q.at || 0 }) }]
  }
  return []
}

/**
 * The cloud's rows for one item_type -> the local blob shape for that key,
 * merged with what's already on this device (device wins a per-item clash,
 * except quiz, where the more recent whole attempt wins).
 */
export function mergeFromRows(key, rows, local) {
  const byId = Object.fromEntries((rows || []).map((r) => [r.item_id, r.status]))

  if (key === SAVED_KEY) {
    const a = Array.isArray(local) ? local.filter((x) => typeof x === 'string') : []
    const b = Object.keys(byId)
    return [...new Set([...a, ...b])]
  }
  if (key === REVIEWS_KEY) {
    const l = local && typeof local === 'object' && !Array.isArray(local) ? local : {}
    return { ...byId, ...l } // local wins a clash
  }
  if (key === VIEWED_KEY) {
    const l = local && typeof local === 'object' && !Array.isArray(local) ? local : {}
    const merged = { ...l }
    for (const id of Object.keys(byId)) merged[id] = true
    return merged
  }
  if (key === QUIZ_KEY) {
    const remoteRow = byId.result
    const remote = remoteRow ? JSON.parse(remoteRow) : null
    const at = (q) => (q && typeof q.at === 'number' ? q.at : 0)
    const has = (q) => q && q.answers && Object.keys(q.answers).length > 0
    if (!has(remote)) return local
    if (!has(local)) return remote
    return at(remote) >= at(local) ? remote : local
  }
  return local
}
