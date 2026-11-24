// The learning data, validated once at load. Everything the Learn, Practice,
// Progress and Start pages need comes from here.

import competenciesData from './competencies.json'
import lessonsData from './lessons.json'
import casesData from './rca-cases.json'
import consumerData from './consumer-exercises.json'
import pathsData from './paths.json'
import interviewData from './interview.json'
import { CATEGORIES } from './schema.js'
import { validateCompetencies, validateLessons, validateCases, validateConsumer, validatePaths, validateInterview } from './learn-schema.js'

export const competencyData = validateCompetencies(competenciesData)
const slugs = competencyData.competencies.map((c) => c.slug)
export const competencies = competencyData.competencies
export const levels = competencyData.levels
export const getCompetency = (slug) => competencies.find((c) => c.slug === slug)

const lessonsValid = validateLessons(lessonsData, slugs)
export const disciplines = lessonsValid.disciplines
export const lessons = lessonsValid.lessons
export const getLesson = (slug) => lessons.find((l) => l.slug === slug)

export const cases = validateCases(casesData, slugs).cases
export const getCase = (slug) => cases.find((c) => c.slug === slug)
for (const c of cases) for (const s of c.learnMore) if (!getLesson(s)) throw new Error(`[learn] case "${c.slug}": learnMore "${s}" is not a lesson`)

export const exercises = validateConsumer(consumerData, slugs).exercises
export const getExercise = (slug) => exercises.find((e) => e.slug === slug)

export const paths = validatePaths(pathsData, {
  lessons: new Set(lessons.map((l) => l.slug)),
  cases: new Set(cases.map((c) => c.slug)),
  consumer: new Set(exercises.map((e) => e.slug)),
}).paths

/** Where a step leads. */
export function stepHref(step) {
  if (step.type === 'lesson') return `/learn/${step.ref}`
  if (step.type === 'rca') return `/practice/rca/${step.ref}`
  if (step.type === 'consumer') return `/practice/consumer/${step.ref}`
  if (step.type === 'quiz') return '/skills/assess'
  if (step.type === 'interview') return '/interview'
  return step.ref
}

/** A step's display title. */
export function stepTitle(step) {
  if (step.type === 'lesson') return getLesson(step.ref).title
  if (step.type === 'rca') return getCase(step.ref).title
  if (step.type === 'consumer') return getExercise(step.ref).title
  if (step.type === 'quiz') return 'Where do you stand? quiz'
  if (step.type === 'interview') return 'Interview simulator'
  return step.title
}

export const interview = validateInterview(interviewData, CATEGORIES)
