// Runs in `prebuild`: fails the build loudly if any data file is malformed.
// Mirrors the checks that the app modules run at load time.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { validateQuestions } from '../src/data/schema.js'
import {
  validateRole,
  validateSkills,
  validateCompanies,
  validateCareers,
  validateIndia,
  validateGuesstimates,
  validateResume,
  validateResources,
} from '../src/data/guides-schema.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')

function load(name) {
  try {
    return JSON.parse(readFileSync(join(dir, name), 'utf8'))
  } catch (err) {
    console.error(`\n✗ Could not parse src/data/${name}\n  ${err.message}\n`)
    process.exit(1)
  }
}

const checks = [
  ['questions.json', (d) => validateQuestions(d), (d) => `${d.length} questions`],
  ['role.json', (d) => validateRole(d), () => 'role guide'],
  ['skills.json', (d) => validateSkills(d), (d) => `${d.technical.skills.length + d.nonTechnical.skills.length} skills`],
  ['companies.json', (d) => validateCompanies(d), (d) => `${d.companies.length} companies`],
  ['careers.json', (d) => validateCareers(d), (d) => `${d.adjacent.length} adjacent roles`],
  ['india.json', (d) => validateIndia(d), (d) => `${d.programs.length} programs`],
  ['guesstimates.json', (d) => validateGuesstimates(d), () => 'guesstimates guide'],
  ['resume.json', (d) => validateResume(d), (d) => `${d.checklist.length}-point checklist`],
  ['resources.json', (d) => validateResources(d), (d) => `${d.groups.length} resource groups`],
]

for (const [file, validate, describe] of checks) {
  const data = load(file)
  try {
    validate(data)
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`)
    process.exit(1)
  }
  console.log(`✓ ${file} — ${describe(data)}`)
}
