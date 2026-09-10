// Build-time schema validation for the question bank.
// Imported by src/data/questions.js (runs on every dev server start and
// production build) and by scripts/validate-questions.mjs (runs in `prebuild`).
// A violation throws — the build fails loudly instead of rendering a broken card.

export const CATEGORIES = [
  'Behavioral',
  'Product Design',
  'Strategy',
  'Analytics',
  'Technical',
  'General',
]

export const CONTENT_TYPES = ['question']

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function fail(message) {
  throw new Error(`[questions] invalid data: ${message}`)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateQuestions(data) {
  if (!Array.isArray(data)) fail('export is not an array')
  if (data.length === 0) fail('array is empty')

  const seen = new Map()

  data.forEach((q, i) => {
    const at = `entry ${i}` + (isNonEmptyString(q && q.id) ? ` ("${q.id}")` : '')

    if (typeof q !== 'object' || q === null) fail(`${at} is not an object`)

    if (!isNonEmptyString(q.id)) fail(`${at} is missing "id"`)
    if (!ID_PATTERN.test(q.id)) {
      fail(`${at} has a non-slug id — use lowercase words joined by hyphens`)
    }
    if (seen.has(q.id)) {
      fail(`duplicate id "${q.id}" (entries ${seen.get(q.id)} and ${i})`)
    }
    seen.set(q.id, i)

    if (!isNonEmptyString(q.type)) fail(`${at} is missing "type"`)
    if (!CONTENT_TYPES.includes(q.type)) {
      fail(`${at} has unknown type "${q.type}" — expected one of ${CONTENT_TYPES.join(', ')}`)
    }

    if (!isNonEmptyString(q.category)) fail(`${at} is missing "category"`)
    if (!CATEGORIES.includes(q.category)) {
      fail(`${at} has unknown category "${q.category}" — expected one of ${CATEGORIES.join(', ')}`)
    }

    if (!isNonEmptyString(q.question)) fail(`${at} is missing "question"`)

    if (!Array.isArray(q.sections) || q.sections.length === 0) {
      fail(`${at} needs at least one section`)
    }
    q.sections.forEach((section, j) => {
      if (typeof section !== 'object' || section === null) {
        fail(`${at} section ${j} is not an object`)
      }
      if (!isNonEmptyString(section.label)) fail(`${at} section ${j} is missing "label"`)
      if (!Array.isArray(section.points) || section.points.length === 0) {
        fail(`${at} section ${j} needs a non-empty "points" array`)
      }
      section.points.forEach((p, k) => {
        if (!isNonEmptyString(p)) fail(`${at} section ${j} point ${k} is empty`)
      })
    })

    // tip is required as a field but may be an empty string (rendered as omitted)
    if (typeof q.tip !== 'string') fail(`${at} is missing "tip" (use "" if there is none)`)

    // failureMode: the mistake that sinks most candidates — required, non-empty
    if (!isNonEmptyString(q.failureMode)) fail(`${at} is missing "failureMode"`)

    if (!Array.isArray(q.companies)) fail(`${at} is missing "companies" array (use [])`)
    q.companies.forEach((c, j) => {
      if (!isNonEmptyString(c)) fail(`${at} company ${j} is not a non-empty string`)
    })

    if (typeof q.hard !== 'boolean') fail(`${at} is missing boolean "hard"`)
  })

  return data
}
