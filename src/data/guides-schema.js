// Pure validators for role.json / skills.json. No imports of the data itself,
// so scripts/validate-data.mjs can use these too.

import { CATEGORIES } from './schema.js'

function fail(msg) {
  throw new Error(`[guides] ${msg}`)
}
const str = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (v) => Array.isArray(v) && v.length > 0

function validateModes(m, where) {
  if (!str(m?.note)) fail(`${where}.modes.note missing`)
  if (!Array.isArray(m?.columns) || m.columns.length !== 3) fail(`${where}.modes needs 3 columns`)
  m.columns.forEach((c) => {
    if (!str(c.key) || !str(c.name) || !str(c.sub)) fail(`${where} mode column: key/name/sub missing`)
  })
  if (!arr(m?.bars)) fail(`${where}.modes.bars missing`)
  m.bars.forEach((b, i) => {
    if (!str(b.dim)) fail(`${where} bar ${i}: dim missing`)
    if (!Array.isArray(b.levels) || b.levels.length !== 3) fail(`${where} bar ${i}: needs 3 levels`)
    b.levels.forEach((l) => {
      if (typeof l !== 'number' || l < 0 || l > 3) fail(`${where} bar ${i}: level must be 0-3`)
    })
    if (!Array.isArray(b.labels) || b.labels.length !== 3) fail(`${where} bar ${i}: needs 3 labels`)
  })
  const sp = m.spectrum
  if (!str(sp?.dim) || !Array.isArray(sp?.ends) || sp.ends.length !== 2) {
    fail(`${where}.modes.spectrum incomplete`)
  }
  if (!Array.isArray(sp.positions) || sp.positions.length !== 3) fail(`${where} spectrum: needs 3 positions`)
  if (!Array.isArray(sp.labels) || sp.labels.length !== 3) fail(`${where} spectrum: needs 3 labels`)
  if (!arr(m?.text)) fail(`${where}.modes.text missing`)
  m.text.forEach((t, i) => {
    if (!str(t.dim)) fail(`${where} text row ${i}: dim missing`)
    if (!Array.isArray(t.values) || t.values.length !== 3) fail(`${where} text row ${i}: needs 3 values`)
  })
}

export function validateRole(r) {
  if (!r || typeof r !== 'object') fail('role.json is not an object')

  const w = r.whatPmDoes
  if (!str(w?.root)) fail('role.whatPmDoes.root missing')
  if (!str(w?.sub)) fail('role.whatPmDoes.sub missing')

  const con = w.constraints
  if (!str(con?.note)) fail('role.whatPmDoes.constraints.note missing')
  if (!Array.isArray(con?.corners) || con.corners.length !== 3) {
    fail('role.whatPmDoes.constraints.corners needs 3')
  }
  con.corners.forEach((p, i) => {
    if (!str(p.label)) fail(`role constraint corner ${i}: label missing`)
  })

  if (!arr(w?.flow)) fail('role.whatPmDoes.flow missing')
  w.flow.forEach((f, i) => {
    if (!str(f.step) || !str(f.short) || !str(f.detail)) fail(`role flow step ${i} incomplete`)
  })
  return r
}

export function validateCareers(c) {
  if (!c || typeof c !== 'object') fail('careers.json is not an object')
  if (!str(c.note)) fail('careers.note missing')
  validateModes(c.modes, 'careers')
  if (!arr(c.adjacent)) fail('careers.adjacent missing')
  c.adjacent.forEach((x, i) => {
    if (!str(x.role) || !str(x.oneLine) || !str(x.vsPm)) fail(`careers.adjacent ${i} incomplete`)
  })
  if (!arr(c.growth)) fail('careers.growth missing')
  c.growth.forEach((x, i) => {
    if (!str(x.level) || !str(x.years) || !str(x.focus)) fail(`careers.growth ${i} incomplete`)
  })
  return c
}

export function validateIndia(d) {
  if (!d || typeof d !== 'object') fail('india.json is not an object')
  if (!str(d.intro)) fail('india.intro missing')

  if (!arr(d.programs)) fail('india.programs missing')
  d.programs.forEach((p, i) => {
    if (!str(p.name) || !str(p.who) || !str(p.note) || !str(p.url)) {
      fail(`india.programs ${i} incomplete`)
    }
    if (!/^https?:\/\//.test(p.url)) fail(`india.programs ${i}.url must be a URL`)
  })

  if (!str(d.noProgram?.note) || !arr(d.noProgram?.options)) fail('india.noProgram incomplete')
  d.noProgram.options.forEach((o, i) => {
    if (!str(o.role) || !str(o.why)) fail(`india.noProgram.options ${i} incomplete`)
  })

  if (!arr(d.misconceptions)) fail('india.misconceptions missing')
  d.misconceptions.forEach((m, i) => {
    if (!Array.isArray(m) || m.length !== 2 || !str(m[0]) || !str(m[1])) {
      fail(`india.misconceptions ${i} must be [claim, reality]`)
    }
  })
  return d
}

export function validateGuesstimates(g) {
  if (!g || typeof g !== 'object') fail('guesstimates.json is not an object')
  if (!str(g.intro)) fail('guesstimates.intro missing')

  const s = g.sizing
  if (!str(s?.title) || !arr(s?.steps)) fail('guesstimates.sizing incomplete')
  if (!str(s.example?.q) || !arr(s.example?.work)) fail('guesstimates.sizing.example incomplete')
  s.example.work.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== 2 || !str(row[0]) || !str(row[1])) {
      fail(`guesstimates.sizing.example.work ${i} must be [label, value]`)
    }
  })

  const dg = g.diagnosis
  if (!str(dg?.title) || !str(dg?.note) || !arr(dg?.steps)) fail('guesstimates.diagnosis incomplete')
  if (!str(dg.tree?.root) || !arr(dg.tree?.branches)) fail('guesstimates.diagnosis.tree incomplete')
  dg.tree.branches.forEach((b, i) => {
    if (!str(b.label) || !arr(b.leaves)) fail(`guesstimates.diagnosis.tree.branches ${i} incomplete`)
  })

  if (!arr(g.questionSets)) fail('guesstimates.questionSets missing')
  g.questionSets.forEach((qs, i) => {
    if (!str(qs.kind) || !str(qs.note)) fail(`guesstimates.questionSets ${i} incomplete`)
    if (!arr(qs.questions)) fail(`guesstimates.questionSets ${i}.questions missing`)
    qs.questions.forEach((q, j) => {
      if (!str(q)) fail(`guesstimates.questionSets ${i}.questions ${j} empty`)
    })
  })

  const a = g.anchors
  if (!str(a?.title) || !str(a?.note) || !arr(a?.rows)) fail('guesstimates.anchors incomplete')
  a.rows.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== 2 || !str(row[0]) || !str(row[1])) {
      fail(`guesstimates.anchors.rows ${i} must be [label, value]`)
    }
  })
  return g
}

export function validateResources(d) {
  if (!d || typeof d !== 'object') fail('resources.json is not an object')
  if (!str(d.intro)) fail('resources.intro missing')
  if (!arr(d.groups)) fail('resources.groups missing')
  d.groups.forEach((g, i) => {
    if (!str(g.name) || !arr(g.items)) fail(`resources.groups ${i} incomplete`)
    g.items.forEach((it, j) => {
      if (!str(it.name) || !str(it.what) || !str(it.url)) {
        fail(`resources.groups ${i}.items ${j} incomplete`)
      }
      if (!/^https?:\/\//.test(it.url)) fail(`resources.groups ${i}.items ${j}.url must be a URL`)
    })
  })
  return d
}

export function validateResume(r) {
  if (!r || typeof r !== 'object') fail('resume.json is not an object')
  if (!str(r.intro)) fail('resume.intro missing')

  const bf = r.bulletFormula
  if (!arr(bf?.parts) || !str(bf?.bad) || !str(bf?.good)) fail('resume.bulletFormula incomplete')

  if (!arr(r.sections)) fail('resume.sections missing')
  r.sections.forEach((s, i) => {
    if (!str(s.name) || !arr(s.keep)) fail(`resume.sections ${i} incomplete`)
  })
  if (!arr(r.mistakes)) fail('resume.mistakes missing')
  if (!arr(r.checklist)) fail('resume.checklist missing')
  return r
}

const WEIGHT_LEVELS = ['heavy', 'medium', 'light']

export function validateCompanies(c) {
  if (!c || typeof c !== 'object') fail('companies.json is not an object')
  if (!str(c.note)) fail('companies.note missing')
  if (!arr(c.companies)) fail('companies.companies missing')
  const seen = new Set()
  c.companies.forEach((co, i) => {
    const at = `companies[${i}]`
    for (const f of ['slug', 'name', 'region', 'program', 'format', 'whatToKnow']) {
      if (!str(co[f])) fail(`${at}.${f} missing`)
    }
    if (!/^[a-z0-9-]+$/.test(co.slug)) fail(`${at}.slug "${co.slug}" is not a slug`)
    if (seen.has(co.slug)) fail(`duplicate company slug "${co.slug}"`)
    seen.add(co.slug)
    if (typeof co.verified !== 'boolean') fail(`${at}.verified must be a boolean`)
    if (!arr(co.rounds)) fail(`${at}.rounds missing`)
    co.rounds.forEach((r, j) => {
      if (typeof r !== 'object' || !str(r.name) || typeof r.detail !== 'string') {
        fail(`${at}.rounds[${j}] must be { name, detail }`)
      }
    })
    if (!arr(co.weights)) fail(`${at}.weights missing`)
    co.weights.forEach((w, j) => {
      if (!Array.isArray(w) || w.length !== 2) fail(`${at}.weights[${j}] must be [category, level]`)
      if (!CATEGORIES.includes(w[0])) fail(`${at}.weights[${j}]: unknown category "${w[0]}"`)
      if (!WEIGHT_LEVELS.includes(w[1])) fail(`${at}.weights[${j}]: level must be heavy/medium/light`)
    })
    if (!Array.isArray(co.questionTags)) fail(`${at}.questionTags must be an array`)
  })
  return c
}

export function validateSkills(s) {
  if (!s || typeof s !== 'object') fail('skills.json is not an object')
  const seen = new Set()

  const chain = s.technical?.chain
  if (!str(chain?.note)) fail('skills.technical.chain.note missing')
  if (!arr(chain?.steps)) fail('skills.technical.chain.steps missing')
  if (!Array.isArray(chain?.labels) || chain.labels.length !== chain.steps.length) {
    fail('skills.technical.chain.labels must match steps')
  }
  if (!arr(chain?.extras)) fail('skills.technical.chain.extras missing')

  for (const track of ['technical', 'nonTechnical']) {
    const t = s[track]
    if (!str(t?.intro)) fail(`skills.${track}.intro missing`)
    if (!arr(t?.skills)) fail(`skills.${track}.skills missing`)
    t.skills.forEach((sk, i) => {
      const at = `skills.${track}[${i}]`
      for (const f of ['slug', 'name', 'gist', 'assess', 'bankCategory']) {
        if (!str(sk[f])) fail(`${at}.${f} missing`)
      }
      if (!arr(sk.need)) fail(`${at}.need must be a non-empty array`)
      sk.need.forEach((n, j) => {
        if (!str(n)) fail(`${at}.need[${j}] empty`)
      })
      if (!/^[a-z0-9-]+$/.test(sk.slug)) fail(`${at}.slug "${sk.slug}" is not a slug`)
      if (seen.has(sk.slug)) fail(`duplicate skill slug "${sk.slug}"`)
      seen.add(sk.slug)
      if (!CATEGORIES.includes(sk.bankCategory)) {
        fail(`${at}.bankCategory "${sk.bankCategory}" is not a question category`)
      }
    })
  }
  return s
}
