// The question bank. All content is authored in questions.json; this module
// validates it at load time and exposes typed selectors to the UI.
//
// To add a question, see README.md — edit questions.json only.

import raw from './questions.json'
import { validateQuestions, CATEGORIES } from './schema'

validateQuestions(raw)

/** @typedef {{ label: string, points: string[] }} Section */
/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {'question'} type
 * @property {string} category
 * @property {string} question
 * @property {Section[]} sections
 * @property {string} tip
 * @property {string} failureMode
 * @property {string[]} companies
 * @property {boolean} hard
 */

/** @type {Question[]} */
export const questions = raw

/** The six fixed categories, in display order. */
export const categories = CATEGORIES

/** URL-safe slug for a category, e.g. "Product Design" -> "product-design". */
export function categorySlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-')
}

/** Inverse of categorySlug. Returns the canonical category name, or null. */
export function categoryFromSlug(slug) {
  if (typeof slug !== 'string') return null
  const target = slug.trim().toLowerCase()
  return categories.find((c) => categorySlug(c) === target) || null
}

const byId = new Map(questions.map((q) => [q.id, q]))
const byLowerId = new Map(questions.map((q) => [q.id.toLowerCase(), q]))

/** Exact-match lookup. Returns undefined for an unknown id. */
export function getQuestion(id) {
  return byId.get(id)
}

/**
 * Resolve a URL param to a canonical question id, tolerating a trailing
 * slash and wrong casing. Returns the canonical id, or null if no match.
 */
export function resolveQuestionId(param) {
  if (typeof param !== 'string') return null
  const cleaned = param.trim().replace(/\/+$/, '').toLowerCase()
  const match = byLowerId.get(cleaned)
  return match ? match.id : null
}

/** Questions in a given category, in bank order. */
export function questionsInCategory(category) {
  return questions.filter((q) => q.category === category)
}

/** The cross-cutting "curveball" set — pricing traps, scaling under constraint, incumbents. */
export function curveballs() {
  return questions.filter((q) => q.hard)
}

/** { [category]: count } for every category, including zeros. */
export function categoryCounts() {
  const counts = Object.fromEntries(categories.map((c) => [c, 0]))
  for (const q of questions) counts[q.category] += 1
  return counts
}

/**
 * Up to `limit` other questions in the same category, nearest first by
 * position in the bank. Deterministic — no randomness.
 */
export function relatedQuestions(question, limit = 3) {
  const siblings = questionsInCategory(question.category)
  const idx = siblings.findIndex((q) => q.id === question.id)
  if (idx === -1) return []
  const ordered = []
  for (let offset = 1; ordered.length < limit && offset < siblings.length; offset += 1) {
    const after = siblings[idx + offset]
    const before = siblings[idx - offset]
    if (after) ordered.push(after)
    if (before && ordered.length < limit) ordered.push(before)
  }
  return ordered
}

/** Previous / next question within the same category (wraps around). */
export function categoryNeighbors(question) {
  const siblings = questionsInCategory(question.category)
  if (siblings.length < 2) return { prev: null, next: null }
  const idx = siblings.findIndex((q) => q.id === question.id)
  return {
    prev: siblings[(idx - 1 + siblings.length) % siblings.length],
    next: siblings[(idx + 1) % siblings.length],
  }
}

/** Full-text haystack for search — question text plus every answer point. */
export function searchText(question) {
  return [
    question.question,
    question.tip,
    question.failureMode,
    ...question.sections.flatMap((s) => s.points),
  ].join(' ')
}
