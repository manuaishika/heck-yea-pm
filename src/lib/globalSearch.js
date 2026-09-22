// The header search: one flat index over questions, methods, companies and
// topics, built once from data already loaded for their own pages. Client
// side, no network call.

import { questions, topics as questionTopics } from '../data/questions'
import { methods } from './methods'
import companiesData from '../data/companies.json'
import { normalize, queryTokens } from './search'

const companies = companiesData.companies

function build() {
  const items = []
  for (const q of questions) {
    items.push({
      type: 'Question',
      label: q.question,
      sub: q.category,
      to: `/browse/${q.id}`,
      hay: normalize(`${q.question} ${q.category}`),
    })
  }
  for (const m of methods) {
    items.push({
      type: 'Method',
      label: m.name,
      sub: m.focus,
      to: `/methods/${m.slug}`,
      hay: normalize(`${m.name} ${m.focus}`),
    })
  }
  for (const c of companies) {
    items.push({
      type: 'Company',
      label: c.name,
      sub: `${c.region} · ${c.program}`,
      to: `/companies/${c.slug}`,
      hay: normalize(`${c.name} ${c.region} ${c.program}`),
    })
  }
  for (const t of questionTopics) {
    items.push({
      type: 'Topic',
      label: t.label,
      sub: 'Cross-cutting tag',
      to: `/browse?topic=${t.slug}`,
      hay: normalize(t.label),
    })
  }
  return items
}

const INDEX = build()
const BY_TYPE = {
  All: INDEX,
  Questions: INDEX.filter((i) => i.type === 'Question'),
  Methods: INDEX.filter((i) => i.type === 'Method'),
  Companies: INDEX.filter((i) => i.type === 'Company'),
}

export const SCOPES = ['All', 'Questions', 'Methods', 'Companies']

/** Up to `limit` matches for `query` within `scope` ("All" by default). */
export function globalSearch(query, scope = 'All', limit = 8) {
  const tokens = queryTokens(query)
  if (tokens.length === 0) return []
  const pool = BY_TYPE[scope] || INDEX
  const out = []
  for (const item of pool) {
    if (tokens.every((t) => item.hay.includes(t))) {
      out.push(item)
      if (out.length >= limit) break
    }
  }
  return out
}
