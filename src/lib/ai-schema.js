// Pure validator for src/data/ai.json. No data import, so
// scripts/validate-data.mjs and the app can both use it.

const fail = (msg) => {
  throw new Error(`[ai] ${msg}`)
}
const str = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (v) => Array.isArray(v) && v.length > 0
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** @param {unknown} d  @param {string[]} questionIds */
export function validateAI(d, questionIds) {
  if (!d || typeof d !== 'object') fail('ai.json is not an object')
  if (!str(d.intro)) fail('ai.intro missing')
  if (!arr(d.topics)) fail('ai.topics missing')

  const seen = new Set()
  d.topics.forEach((t, i) => {
    const at = `topic ${i}${str(t?.slug) ? ` ("${t.slug}")` : ''}`
    if (!str(t?.slug) || !SLUG.test(t.slug)) fail(`${at}: slug missing or not a slug`)
    if (seen.has(t.slug)) fail(`${at}: duplicate slug`)
    seen.add(t.slug)
    if (!str(t.name) || !str(t.gist) || !str(t.howItWorks)) {
      fail(`${at}: name, gist and howItWorks are all required`)
    }
    if (!arr(t.need)) fail(`${at}: need missing`)
    t.need.forEach((n) => {
      if (!str(n)) fail(`${at}: an empty need[] entry`)
    })
    if (t.practiceId !== null && t.practiceId !== undefined) {
      if (!str(t.practiceId)) fail(`${at}: practiceId must be a string or null`)
      if (questionIds && !questionIds.includes(t.practiceId)) {
        fail(`${at}: practiceId "${t.practiceId}" is not in the question bank`)
      }
    }
  })

  if (!d.responsibleAi || typeof d.responsibleAi !== 'object') {
    fail('ai.responsibleAi missing')
  }
  if (typeof d.responsibleAi.drafted !== 'boolean') fail('ai.responsibleAi.drafted must be true/false')
  if (!str(d.responsibleAi.note)) fail('ai.responsibleAi.note missing')

  return d
}
