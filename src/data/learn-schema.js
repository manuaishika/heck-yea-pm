// Build-time validators for the learning data: competencies, lessons, RCA
// cases, consumer exercises and learning paths. A malformed file fails the
// build, not the page. No imports of the data itself, so
// scripts/validate-data.mjs can use these too.

function fail(msg) {
  throw new Error(`[learn] ${msg}`)
}
const str = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (v) => Array.isArray(v) && v.length > 0
const strs = (v) => arr(v) && v.every(str)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const slug = (v, at) => {
  if (!str(v) || !SLUG.test(v)) fail(`${at}: slug missing or not a slug`)
}
const unique = (list, key, where) => {
  const seen = new Set()
  for (const x of list) {
    if (seen.has(x[key])) fail(`${where}: duplicate ${key} "${x[key]}"`)
    seen.add(x[key])
  }
}

export const PERSONAS = ['aspiring', 'working', 'technical']

export function validateCompetencies(c) {
  if (!arr(c?.competencies) || c.competencies.length !== 12) fail('competencies: need exactly 12')
  c.competencies.forEach((x, i) => {
    slug(x.slug, `competencies ${i}`)
    if (!str(x.name) || !str(x.blurb) || !str(x.demonstrate)) fail(`competencies ${i}: name, blurb, demonstrate required`)
  })
  unique(c.competencies, 'slug', 'competencies')
  if (!arr(c.levels) || c.levels.length !== 4) fail('competencies.levels: need 4')
  c.levels.forEach((l, i) => {
    if (l.level !== i + 1 || !str(l.name) || !str(l.line)) fail(`competencies.levels ${i} incomplete`)
  })
  const known = new Set(c.competencies.map((x) => x.slug))
  for (const [k, v] of Object.entries(c.skillMap || {})) if (!known.has(v)) fail(`skillMap ${k}: unknown competency ${v}`)
  for (const [k, v] of Object.entries(c.categoryMap || {})) if (!known.has(v)) fail(`categoryMap ${k}: unknown competency ${v}`)
  return c
}

const mcq = (list, at) => {
  if (!arr(list)) fail(`${at}: questions missing`)
  list.forEach((q, i) => {
    if (!str(q.q) || !strs(q.options) || q.options.length < 3 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length || !str(q.why)) {
      fail(`${at} question ${i} incomplete`)
    }
  })
}

export function validateLessons(d, competencySlugs) {
  const known = new Set(competencySlugs)
  if (!arr(d?.disciplines)) fail('lessons.disciplines missing')
  d.disciplines.forEach((x, i) => {
    slug(x.slug, `disciplines ${i}`)
    if (!str(x.name) || !arr(x.subjects)) fail(`disciplines ${i}: name and subjects required`)
    x.subjects.forEach((s, j) => {
      slug(s.slug, `disciplines ${i}.subjects ${j}`)
      if (!str(s.name)) fail(`disciplines ${i}.subjects ${j}: name required`)
    })
    if (x.planned !== undefined && !strs(x.planned)) fail(`disciplines ${i}: planned must be strings`)
  })
  unique(d.disciplines, 'slug', 'disciplines')
  const subjectsOf = Object.fromEntries(d.disciplines.map((x) => [x.slug, new Set(x.subjects.map((s) => s.slug))]))

  if (!arr(d.lessons)) fail('lessons.lessons missing')
  unique(d.lessons, 'slug', 'lessons')
  const slugs = new Set(d.lessons.map((l) => l.slug))
  d.lessons.forEach((l) => {
    const at = `lesson "${l.slug}"`
    slug(l.slug, at)
    if (!subjectsOf[l.discipline]) fail(`${at}: unknown discipline ${l.discipline}`)
    if (!subjectsOf[l.discipline].has(l.subject)) fail(`${at}: subject ${l.subject} is not in ${l.discipline}`)
    if (!str(l.title) || !str(l.topic)) fail(`${at}: title and topic required`)
    if (!arr(l.competencies) || !l.competencies.every((c) => known.has(c))) fail(`${at}: competencies missing or unknown`)
    if (![1, 2, 3, 4].includes(l.level)) fail(`${at}: level must be 1-4`)
    if (!Number.isInteger(l.minutes) || l.minutes < 3) fail(`${at}: minutes required`)
    if (!arr(l.audience) || !l.audience.every((a) => PERSONAS.includes(a))) fail(`${at}: audience must be from ${PERSONAS.join(', ')}`)
    for (const p of l.prerequisites || []) if (!slugs.has(p) || p === l.slug) fail(`${at}: bad prerequisite ${p}`)
    for (const n of l.next || []) if (!slugs.has(n) || n === l.slug) fail(`${at}: bad next ${n}`)
    if (!strs(l.objectives)) fail(`${at}: objectives required`)
    if (!str(l.definition) || !str(l.whyItMatters)) fail(`${at}: definition and whyItMatters required`)
    for (const k of ['howItWorks', 'realWorld', 'mistakes', 'whyThingsFail', 'tradeoffs']) if (!strs(l[k])) fail(`${at}: ${k} required`)
    if (!arr(l.terms) || !l.terms.every((t) => str(t.term) && str(t.def))) fail(`${at}: terms incomplete`)
    if (!arr(l.examples) || !l.examples.every((t) => str(t.title) && str(t.text))) fail(`${at}: examples incomplete`)
    if (!str(l.guided?.prompt) || !strs(l.guided?.steps)) fail(`${at}: guided exercise incomplete`)
    if (!str(l.independent?.prompt) || !strs(l.independent?.rubric)) fail(`${at}: independent exercise incomplete`)
    mcq(l.assessment, `${at} assessment`)
    if (l.references !== undefined && !(Array.isArray(l.references) && l.references.every((r) => str(r.label)))) fail(`${at}: references malformed`)
  })
  // prerequisites must not loop
  const byslug = Object.fromEntries(d.lessons.map((l) => [l.slug, l]))
  const visiting = new Set()
  const walk = (s) => {
    if (visiting.has(s)) fail(`prerequisite loop at ${s}`)
    visiting.add(s)
    for (const p of byslug[s].prerequisites || []) walk(p)
    visiting.delete(s)
  }
  d.lessons.forEach((l) => walk(l.slug))
  return d
}

export function validateCases(d, competencySlugs) {
  const known = new Set(competencySlugs)
  if (!arr(d?.cases)) fail('rca.cases missing')
  unique(d.cases, 'slug', 'rca cases')
  d.cases.forEach((c) => {
    const at = `rca case "${c.slug}"`
    slug(c.slug, at)
    if (!str(c.title) || !str(c.company) || !str(c.metric) || !str(c.background) || !str(c.problem)) fail(`${at}: title, company, metric, background, problem required`)
    if (![1, 2, 3].includes(c.difficulty)) fail(`${at}: difficulty must be 1-3`)
    if (!Number.isInteger(c.minutes)) fail(`${at}: minutes required`)
    if (!arr(c.competencies) || !c.competencies.every((x) => known.has(x))) fail(`${at}: competencies unknown`)
    if (c.illustrative !== true) fail(`${at}: illustrative must be true — cases use made-up data and say so`)
    if (!arr(c.evidence) || c.evidence.length < 6) fail(`${at}: need at least 6 evidence items`)
    unique(c.evidence, 'id', at)
    c.evidence.forEach((e) => {
      slug(e.id, `${at} evidence`)
      if (!str(e.ask) || !str(e.group) || !['key', 'useful', 'noise'].includes(e.weight)) fail(`${at} evidence ${e.id}: ask, group, weight (key|useful|noise) required`)
      if (!str(e.reveals) && !(arr(e.table) && e.table.every(Array.isArray))) fail(`${at} evidence ${e.id}: reveals text or table required`)
      if (!str(e.insight)) fail(`${at} evidence ${e.id}: insight required`)
    })
    if (!c.evidence.some((e) => e.weight === 'key')) fail(`${at}: needs key evidence`)
    if (!arr(c.hypotheses) || c.hypotheses.length < 4) fail(`${at}: need at least 4 hypotheses`)
    unique(c.hypotheses, 'id', `${at} hypotheses`)
    if (c.hypotheses.filter((h) => h.cause === true).length !== 1) fail(`${at}: exactly one hypothesis must be the cause`)
    c.hypotheses.forEach((h) => {
      slug(h.id, `${at} hypotheses`)
      if (!str(h.text) || !str(h.why) || typeof h.cause !== 'boolean') fail(`${at} hypothesis ${h.id}: text, why, cause required`)
      for (const id of h.confirmedBy || []) if (!c.evidence.some((e) => e.id === id)) fail(`${at} hypothesis ${h.id}: unknown evidence ${id}`)
      for (const id of h.ruledOutBy || []) if (!c.evidence.some((e) => e.id === id)) fail(`${at} hypothesis ${h.id}: unknown evidence ${id}`)
    })
    const cause = c.hypotheses.find((h) => h.cause)
    if (!arr(cause.confirmedBy)) fail(`${at}: the cause needs confirmedBy evidence`)
    if (!strs(c.recommendation?.rubric) || !str(c.recommendation?.model)) fail(`${at}: recommendation.rubric and .model required`)
    if (!strs(c.mistakes) || !strs(c.learnMore)) fail(`${at}: mistakes and learnMore required`)
    if (!str(c.modelReasoning)) fail(`${at}: modelReasoning required`)
  })
  return d
}

export function validateConsumer(d, competencySlugs) {
  const known = new Set(competencySlugs)
  const KINDS = ['fact', 'statement', 'assumption', 'hypothesis']
  if (!arr(d?.exercises)) fail('consumer.exercises missing')
  unique(d.exercises, 'slug', 'consumer exercises')
  d.exercises.forEach((x) => {
    const at = `consumer exercise "${x.slug}"`
    slug(x.slug, at)
    if (!str(x.title) || !str(x.job) || !str(x.scenario)) fail(`${at}: title, job, scenario required`)
    if (![1, 2, 3, 4].includes(x.level)) fail(`${at}: level must be 1-4`)
    if (x.illustrative !== true) fail(`${at}: illustrative must be true`)
    if (!arr(x.competencies) || !x.competencies.every((c) => known.has(c))) fail(`${at}: competencies unknown`)
    if (!arr(x.material) || !x.material.every((m) => str(m.label) && str(m.text))) fail(`${at}: material incomplete`)
    if (!arr(x.claims) || x.claims.length < 6) fail(`${at}: need at least 6 claims`)
    x.claims.forEach((c, i) => {
      if (!str(c.text) || !KINDS.includes(c.kind) || !str(c.why)) fail(`${at} claim ${i}: text, kind (${KINDS.join('|')}), why required`)
      if (c.overgeneralises !== undefined && typeof c.overgeneralises !== 'boolean') fail(`${at} claim ${i}: overgeneralises must be boolean`)
    })
    if (!KINDS.every((k) => x.claims.some((c) => c.kind === k))) fail(`${at}: use every claim kind at least once`)
    if (!arr(x.evidenceNeeded) || x.evidenceNeeded.length < 4) fail(`${at}: need at least 4 evidence options`)
    x.evidenceNeeded.forEach((e, i) => {
      if (!str(e.text) || typeof e.useful !== 'boolean' || !str(e.why)) fail(`${at} evidence ${i}: text, useful, why required`)
    })
    if (!x.evidenceNeeded.some((e) => e.useful)) fail(`${at}: at least one useful evidence option`)
    if (!arr(x.hypothesisOptions) || x.hypothesisOptions.length < 3) fail(`${at}: need at least 3 hypothesis options`)
    x.hypothesisOptions.forEach((h, i) => {
      if (!str(h.text) || typeof h.good !== 'boolean' || !str(h.why)) fail(`${at} hypothesis ${i}: text, good, why required`)
    })
    if (!x.hypothesisOptions.some((h) => h.good)) fail(`${at}: at least one good hypothesis`)
    if (!strs(x.takeaways)) fail(`${at}: takeaways required`)
  })
  return d
}

export function validatePaths(d, ids) {
  if (!d?.paths || typeof d.paths !== 'object') fail('paths missing')
  for (const persona of PERSONAS) {
    const p = d.paths[persona]
    if (!str(p?.name) || !str(p?.goal) || !arr(p?.steps)) fail(`paths.${persona}: name, goal, steps required`)
    const seen = new Set()
    p.steps.forEach((s, i) => {
      const at = `paths.${persona} step ${i}`
      if (!['lesson', 'rca', 'consumer', 'quiz', 'interview', 'link'].includes(s.type)) fail(`${at}: unknown type ${s.type}`)
      if (!str(s.stage) || !str(s.why)) fail(`${at}: stage and why required`)
      if (s.type === 'lesson' && !ids.lessons.has(s.ref)) fail(`${at}: unknown lesson ${s.ref}`)
      if (s.type === 'rca' && !ids.cases.has(s.ref)) fail(`${at}: unknown case ${s.ref}`)
      if (s.type === 'consumer' && !ids.consumer.has(s.ref)) fail(`${at}: unknown exercise ${s.ref}`)
      if (s.type === 'link' && (!str(s.ref) || !s.ref.startsWith('/') || !str(s.title))) fail(`${at}: link needs ref starting with / and a title`)
      const key = `${s.type}:${s.ref ?? ''}`
      if (seen.has(key)) fail(`${at}: duplicate step ${key}`)
      seen.add(key)
    })
  }
  return d
}

export function validateInterview(d, categories) {
  if (!arr(d?.rubric) || d.rubric.length !== 5) fail('interview.rubric: need 5 criteria')
  d.rubric.forEach((r, i) => {
    slug(r.key, `interview.rubric ${i}`)
    if (!str(r.name) || !Array.isArray(r.levels) || r.levels.length !== 5 || !r.levels.every(str) || !str(r.next)) fail(`interview.rubric ${i}: name, 5 levels and next required`)
  })
  unique(d.rubric, 'key', 'interview.rubric')
  for (const c of categories) if (!strs(d.followUps?.[c]) || d.followUps[c].length < 3) fail(`interview.followUps: need 3+ prompts for ${c}`)
  if (!arr(d.bands) || d.bands[0].min !== 0) fail('interview.bands: first band must start at 0')
  d.bands.forEach((b, i) => {
    if (typeof b.min !== 'number' || !str(b.label) || !str(b.line)) fail(`interview.bands ${i} incomplete`)
    if (i > 0 && b.min <= d.bands[i - 1].min) fail('interview.bands must ascend')
  })
  return d
}
