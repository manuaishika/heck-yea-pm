// Answering frameworks, and the two-way mapping to questions.
// Methods map to categories (optionally narrowed by keywords in the question
// text) in methods.json; questions.json is never edited to point at a method.

import raw from '../data/methods.json'
import { questions, getQuestion } from '../data/questions'
import { validateMethods } from './methods-schema'

validateMethods(
  raw,
  questions.map((q) => q.id)
)

export const methods = raw.methods

export function getMethod(slug) {
  return methods.find((m) => m.slug === slug)
}

const has = (text, words) => {
  const t = text.toLowerCase()
  return words.some((w) => t.includes(w.toLowerCase()))
}

/** The questions a method applies to: its categories, narrowed by keyword when it has any. */
export function questionsForMethod(method) {
  const inCategory = questions.filter((q) => method.categories.includes(q.category))
  if (!method.narrow?.length) return inCategory
  const narrowed = inCategory.filter((q) => has(q.question, method.narrow))
  return narrowed.length > 0 ? narrowed : inCategory
}

/**
 * Methods to show on a question: those whose narrowed list includes it, or,
 * failing that, every method for its category. Empty for categories with no
 * method (Technical, General).
 */
export function methodsForQuestion(question) {
  const forCategory = methods.filter((m) => m.categories.includes(question.category))
  const direct = forCategory.filter((m) => questionsForMethod(m).some((q) => q.id === question.id))
  return direct.length > 0 ? direct : forCategory
}

export const exampleQuestion = (method) => getQuestion(method.example.question)
