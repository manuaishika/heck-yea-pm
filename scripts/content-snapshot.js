// Rule zero: nothing in the data files may be deleted by a redesign pass.
//
// `node scripts/content-snapshot.js` (re)writes content-snapshot.json from
// the data files as they are right now — run it by hand only when content
// was deliberately added or removed and the new baseline should be trusted.
// `node scripts/content-snapshot.js --check`, wired into prebuild, instead
// compares the current data against that baseline and fails the build if
// any snapshotted id is missing. Adding new ids never fails the check.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'content-snapshot.json')

const load = (name) => JSON.parse(readFileSync(join(dir, name), 'utf8'))

// Every id/slug this counts as content, one array per content type. Adding a
// new data file with ids means adding one line here.
function snapshot() {
  const questions = load('questions.json')
  const skills = load('skills.json')
  const companies = load('companies.json')
  const methods = load('methods.json')
  const ai = load('ai.json')
  const resources = load('resources.json')
  const careers = load('careers.json')
  const india = load('india.json')
  const guesstimates = load('guesstimates.json')
  const quiz = load('quiz.json')

  return {
    questions: questions.map((q) => q.id).sort(),
    'skills.technical': skills.technical.skills.map((s) => s.slug).sort(),
    'skills.nonTechnical': skills.nonTechnical.skills.map((s) => s.slug).sort(),
    companies: companies.companies.map((c) => c.slug).sort(),
    methods: methods.methods.map((m) => m.slug).sort(),
    'ai.topics': ai.topics.map((t) => t.slug).sort(),
    'resources.groups': resources.groups.map((g) => g.name).sort(),
    'careers.adjacent': careers.adjacent.map((a) => a.role).sort(),
    'india.programs': india.programs.map((p) => p.name).sort(),
    'guesstimates.questions': guesstimates.questionSets
      .flatMap((s) => s.questions.map((q) => q.q))
      .sort(),
    'quiz.questions': quiz.questions.map((q) => q.id ?? q.question ?? JSON.stringify(q)).sort(),
  }
}

function fail(msg) {
  console.error(`\n✗ [content-snapshot] ${msg}\n`)
  process.exit(1)
}

const mode = process.argv[2]
const current = snapshot()

if (mode === '--check') {
  if (!existsSync(outPath)) {
    fail('content-snapshot.json does not exist — run `node scripts/content-snapshot.js` once to create the baseline')
  }
  const baseline = JSON.parse(readFileSync(outPath, 'utf8'))
  let missingTotal = 0
  for (const key of Object.keys(baseline)) {
    const before = new Set(baseline[key] || [])
    const after = new Set(current[key] || [])
    const missing = [...before].filter((id) => !after.has(id))
    if (missing.length > 0) {
      missingTotal += missing.length
      console.error(`✗ [content-snapshot] ${key}: ${missing.length} missing — ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', …' : ''}`)
    }
  }
  if (missingTotal > 0) {
    fail(`${missingTotal} content item(s) removed since the last snapshot. If this was deliberate, run \`node scripts/content-snapshot.js\` to update the baseline.`)
  }
  const totalNow = Object.values(current).reduce((n, arr) => n + arr.length, 0)
  console.log(`✓ content-snapshot — ${totalNow} content items, none missing`)
} else {
  writeFileSync(outPath, JSON.stringify(current, null, 2) + '\n')
  const total = Object.values(current).reduce((n, arr) => n + arr.length, 0)
  console.log(`✓ wrote content-snapshot.json — ${total} content items across ${Object.keys(current).length} types`)
}
