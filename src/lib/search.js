import { searchText } from '../data/questions'

/**
 * Lowercase, strip diacritics and punctuation, collapse whitespace.
 * "What's the *North-Star*?" -> "what s the north star"
 */
export function normalize(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Tokens of a normalized query. Empty query -> []. */
export function queryTokens(query) {
  const n = normalize(query)
  return n ? n.split(' ') : []
}

const haystackCache = new WeakMap()

function haystack(question) {
  let value = haystackCache.get(question)
  if (value === undefined) {
    value = normalize(searchText(question))
    haystackCache.set(question, value)
  }
  return value
}

/** True if every query token appears somewhere in the question. */
export function matchesQuery(question, tokens) {
  if (tokens.length === 0) return true
  const hay = haystack(question)
  return tokens.every((t) => hay.includes(t))
}
