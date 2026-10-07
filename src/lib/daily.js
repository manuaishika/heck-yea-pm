import { questions, categories } from '../data/questions'
import { quiz, getSkill } from '../data/guides'

// The daily order: the bank dealt round-robin across the categories, so
// consecutive days never repeat a category. Fixed, so a given date shows the
// same question to everyone.
const groups = categories.map((c) => questions.filter((q) => q.category === c))
export const dailyOrder = []
for (let i = 0; groups.some((g) => i < g.length); i += 1) {
  for (const g of groups) if (i < g.length) dailyOrder.push(g[i])
}

/** The question for a day number (see dayNumber), `extra` steps further on. */
export function questionForDay(day, extra = 0) {
  return dailyOrder[(day + extra) % dailyOrder.length]
}

/** Question categories the quiz says are weak: the bank category of every skill answered wrong. */
export function weakCategories(answers) {
  const weak = new Set()
  for (const item of quiz.questions) {
    if (item.skill in answers && answers[item.skill] !== item.answer) {
      const category = getSkill(item.skill)?.bankCategory
      if (category) weak.add(category)
    }
  }
  return weak
}

/**
 * A second question for today: one marked needs work, else an unrated one
 * from a weak category. Rotates with the day so it is not always the same card.
 * @returns {{ q: object, why: string } | null}
 */
export function pickRevisit(marks, answers, day, skipId) {
  const redo = questions.filter((q) => marks[q.id] === 'review' && q.id !== skipId)
  if (redo.length) return { q: redo[day % redo.length], why: 'You marked this needs work.' }
  const weak = weakCategories(answers)
  const open = questions.filter((q) => !marks[q.id] && weak.has(q.category) && q.id !== skipId)
  if (open.length) {
    const q = open[day % open.length]
    return { q, why: `Weak spot from the quiz: ${q.category.toLowerCase()}.` }
  }
  return null
}
