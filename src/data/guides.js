// Role, skills, and company content. Authored in the matching .json files,
// validated at load time so a missing field fails the build.

import roleData from './role.json'
import skillsData from './skills.json'
import companiesData from './companies.json'
import careersData from './careers.json'
import indiaData from './india.json'
import guesstimatesData from './guesstimates.json'
import resumeData from './resume.json'
import resourcesData from './resources.json'
import quizData from './quiz.json'
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
} from './guides-schema'
import { questions } from './questions'

export const role = validateRole(roleData)
export const skills = validateSkills(skillsData)
export const careers = validateCareers(careersData)
export const india = validateIndia(indiaData)
export const guesstimates = validateGuesstimates(guesstimatesData)
export const resume = validateResume(resumeData)
export const resources = validateResources(resourcesData)

const validatedCompanies = validateCompanies(companiesData)
export const companiesNote = validatedCompanies.note
export const companies = validatedCompanies.companies

/** Flat list of every skill with its track attached. */
export const allSkills = [
  ...skills.technical.skills.map((s) => ({ ...s, track: 'technical' })),
  ...skills.nonTechnical.skills.map((s) => ({ ...s, track: 'nonTechnical' })),
]

export const quiz = validateQuiz(
  quizData,
  allSkills.map((s) => s.slug)
)

export function getSkill(slug) {
  return allSkills.find((s) => s.slug === slug)
}

export function getCompany(slug) {
  return companies.find((c) => c.slug === slug)
}

/** Questions whose `companies` tag matches one of a company's questionTags. */
export function questionsForCompany(company) {
  if (!company.questionTags.length) return []
  const tags = new Set(company.questionTags)
  return questions.filter((q) => q.companies.some((c) => tags.has(c)))
}

/** A company worth its own page: a sourced loop, or questions tagged to it.
 * Everything else links to the general question bank instead. */
export function companyHasData(company) {
  return company.rounds.length > 0 || questionsForCompany(company).length > 0
}

/** Where a company's logo leads: its own page when there's data behind it,
 * otherwise the general question bank. */
export const companyHref = (company) => (companyHasData(company) ? `/companies/${company.slug}` : '/browse')
