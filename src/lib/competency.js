// Competency levels from evidence. Pure functions: no storage, no React.
//
// An event is one scored attempt: { t, kind, ref, comps, level, score, assisted, self }.
//   level     1 understand, 2 apply, 3 analyze, 4 demonstrate (what the activity tests)
//   score     0 to 1
//   assisted  hints or a revealed answer were used
//   self      the learner scored themselves against a rubric
// A competency's level is the highest level at which the learner scored 70%
// or more. Assisted attempts count up to level 2 only, so help never lifts
// someone to "analyze" or "demonstrate".

export const PASS = 0.7
export const RECENT = 5

export function eventsFromQuiz(quiz, answers, skillMap, at = 0) {
  return quiz.questions
    .filter((q) => q.skill in answers && skillMap[q.skill])
    .map((q) => ({ t: at, kind: 'quiz', ref: q.skill, comps: [skillMap[q.skill]], level: 1, score: answers[q.skill] === q.answer ? 1 : 0, assisted: false, self: false }))
}

export function competencyState(slug, events) {
  const mine = events.filter((e) => e.comps.includes(slug))
  const independent = mine.filter((e) => !e.assisted)
  let level = 0
  for (const e of mine) {
    if (e.score >= PASS) level = Math.max(level, e.assisted ? Math.min(e.level, 2) : e.level)
  }
  const recent = [...independent].sort((a, b) => b.t - a.t).slice(0, RECENT)
  const avg = recent.length ? recent.reduce((n, e) => n + e.score, 0) / recent.length : null
  return { slug, level, avg, attempts: mine.length, independent: independent.length, assisted: mine.length - independent.length, self: mine.filter((e) => e.self).length }
}

export function allCompetencies(competencies, events) {
  return competencies.map((c) => ({ ...c, ...competencyState(c.slug, events) }))
}

/** Weak: attempted, with a recent average under the pass mark. */
export const isWeak = (state) => state.avg !== null && state.avg < PASS

export function levelLabel(levels, n) {
  return n === 0 ? 'Not started' : `Level ${n} · ${levels[n - 1].name}`
}
