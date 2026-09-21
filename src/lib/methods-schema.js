// Pure validator for src/data/methods.json. Imports no data itself, so
// scripts/validate-data.mjs and the app can both use it.

import { CATEGORIES } from '../data/schema.js'

function fail(msg) {
  throw new Error(`[methods] ${msg}`)
}
const str = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (v) => Array.isArray(v) && v.length > 0
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** @param {unknown} d  @param {string[]} questionIds */
export function validateMethods(d, questionIds) {
  if (!d || !arr(d.methods)) fail('methods.json needs a non-empty "methods" array')
  const seen = new Set()
  d.methods.forEach((m, i) => {
    const at = `method ${i}${str(m?.slug) ? ` ("${m.slug}")` : ''}`
    if (!str(m?.slug) || !SLUG.test(m.slug)) fail(`${at}: slug missing or not a slug`)
    if (seen.has(m.slug)) fail(`${at}: duplicate slug`)
    seen.add(m.slug)
    if (!str(m.name) || !str(m.focus) || !str(m.when) || !str(m.failure)) {
      fail(`${at}: name, focus, when and failure are all required`)
    }
    if (!arr(m.categories)) fail(`${at}: categories missing`)
    m.categories.forEach((c) => {
      if (!CATEGORIES.includes(c)) fail(`${at}: unknown category "${c}"`)
    })
    if (m.narrow !== undefined && !(Array.isArray(m.narrow) && m.narrow.every(str))) {
      fail(`${at}: narrow must be an array of non-empty strings`)
    }
    if (!arr(m.steps)) fail(`${at}: steps missing`)
    m.steps.forEach((s, j) => {
      if (!Array.isArray(s) || s.length !== 2 || !str(s[0]) || !str(s[1])) {
        fail(`${at}: step ${j} must be [label, detail]`)
      }
    })
    if (!str(m.example?.question) || !arr(m.example?.work)) fail(`${at}: example incomplete`)
    if (questionIds && !questionIds.includes(m.example.question)) {
      fail(`${at}: example.question "${m.example.question}" is not in the question bank`)
    }
    m.example.work.forEach((w, j) => {
      if (!Array.isArray(w) || w.length !== 2 || !str(w[0]) || !str(w[1])) {
        fail(`${at}: example.work ${j} must be [label, text]`)
      }
    })
  })
  return d
}
