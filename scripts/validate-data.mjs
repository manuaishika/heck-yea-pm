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
  validateQuiz,
} from '../src/data/guides-schema.js'
import { validateMethods } from '../src/lib/methods-schema.js'
import { CATEGORIES } from '../src/data/schema.js'
import { validateAI } from '../src/lib/ai-schema.js'
import { validateCompetencies, validateLessons, validateCases, validateConsumer, validatePaths, validateInterview } from '../src/data/learn-schema.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')

function load(name) {
  try {
    return JSON.parse(readFileSync(join(dir, name), 'utf8'))
  } catch (err) {
    console.error(`\n✗ Could not parse src/data/${name}\n  ${err.message}\n`)
    process.exit(1)
  }
}

const competencySlugs = () => load('competencies.json').competencies.map((c) => c.slug)

const checks = [
  ['interview.json', (d) => validateInterview(d, CATEGORIES), (d) => `${d.rubric.length} rubric criteria`],
  ['competencies.json', (d) => validateCompetencies(d), (d) => `${d.competencies.length} competencies`],
  ['lessons.json', (d) => validateLessons(d, competencySlugs()), (d) => `${d.lessons.length} lessons`],
  ['rca-cases.json', (d) => validateCases(d, competencySlugs()), (d) => `${d.cases.length} root cause cases`],
  ['consumer-exercises.json', (d) => validateConsumer(d, competencySlugs()), (d) => `${d.exercises.length} consumer exercises`],
  [
    'paths.json',
    (d) =>
      validatePaths(d, {
        lessons: new Set(load('lessons.json').lessons.map((l) => l.slug)),
        cases: new Set(load('rca-cases.json').cases.map((c) => c.slug)),
        consumer: new Set(load('consumer-exercises.json').exercises.map((e) => e.slug)),
      }),
    (d) => `${Object.keys(d.paths).length} learning paths`,
  ],
  ['questions.json', (d) => validateQuestions(d), (d) => `${d.length} questions`],
  ['role.json', (d) => validateRole(d), () => 'role guide'],
  ['skills.json', (d) => validateSkills(d), (d) => `${d.technical.skills.length + d.nonTechnical.skills.length} skills`],
  ['companies.json', (d) => validateCompanies(d), (d) => `${d.companies.length} companies`],
  ['careers.json', (d) => validateCareers(d), (d) => `${d.roleTypes.length} role types`],
  ['india.json', (d) => validateIndia(d), (d) => `${d.programs.length} programs`],
  ['guesstimates.json', (d) => validateGuesstimates(d), () => 'guesstimates guide'],
  ['resume.json', (d) => validateResume(d), (d) => `${d.checklist.length}-point checklist`],
  ['resources.json', (d) => validateResources(d), (d) => `${d.groups.length} resource groups`],
  [
    'methods.json',
    (d) => validateMethods(d, load('questions.json').map((q) => q.id)),
    (d) => `${d.methods.length} methods`,
  ],
  [
    'ai.json',
    (d) => validateAI(d, load('questions.json').map((q) => q.id)),
    (d) => `${d.topics.length} AI topics`,
  ],
  [
    'quiz.json',
    (d) => {
      const s = load('skills.json')
      return validateQuiz(d, [...s.technical.skills, ...s.nonTechnical.skills].map((k) => k.slug))
    },
    (d) => `${d.questions.length} quiz questions`,
  ],
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
