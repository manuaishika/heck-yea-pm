// Learning paths: the persona's path, trimmed by the learner's profile, with
// each step marked done from what they have actually done.

export const stepKey = (s) => `${s.type}:${s.ref ?? ''}`

/**
 * @param {object} path       paths[persona]
 * @param {object} profile    { tech, skip }
 * @param {object} state      { events, quizComplete, doneLinks }
 */
export function buildPath(path, profile, state) {
  const skip = new Set(profile.skip || [])
  const has = (kind, ref) => state.events.some((e) => e.kind === kind && (ref === undefined || e.ref === ref))
  const steps = path.steps
    .filter((s) => !(s.basics && profile.tech === 'strong'))
    .map((s) => {
      const key = stepKey(s)
      let done = false
      if (s.type === 'lesson') done = has('lesson-quiz', s.ref)
      else if (s.type === 'rca') done = has('rca', s.ref)
      else if (s.type === 'consumer') done = has('consumer', s.ref)
      else if (s.type === 'quiz') done = state.quizComplete
      else if (s.type === 'interview') done = has('interview')
      else done = state.doneLinks.includes(key)
      return { ...s, key, done, skipped: skip.has(key) && !done }
    })
  const next = steps.find((s) => !s.done && !s.skipped) || null
  const open = steps.filter((s) => !s.skipped)
  return { steps, next, doneCount: open.filter((s) => s.done).length, total: open.length }
}

/** How many open steps fit in the time a learner has, at about 25 minutes a step. */
export function stepsPerWeek(hours) {
  return Math.max(1, Math.round((hours * 60) / 25))
}

/** Move a weak competency's lessons to the front of the remaining steps. */
export function prioritise(steps, weakSlugs, lessonsBySlug) {
  if (!weakSlugs.length) return steps
  const hits = (s) => s.type === 'lesson' && !s.done && lessonsBySlug[s.ref]?.competencies.some((c) => weakSlugs.includes(c))
  const done = steps.filter((s) => s.done)
  const rest = steps.filter((s) => !s.done)
  return [...done, ...rest.filter(hits), ...rest.filter((s) => !hits(s))]
}
