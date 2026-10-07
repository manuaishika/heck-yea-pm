import { questions, categories } from '../data/questions'

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
