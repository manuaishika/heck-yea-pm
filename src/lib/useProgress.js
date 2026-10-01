import { useEffect } from 'react'
import { useViewed } from './useViewed'

// Real progress for the homepage checklist, kept in the same store as the
// flowchart marks (useViewed), under "progress.*" ids, so it syncs the same
// way when signed in.

/** Mark `id` as done once the page that calls this has rendered. Pass null
 * to skip (e.g. a page that turned out to be a 404). */
export function useMarkProgress(id) {
  const { markViewed } = useViewed()
  useEffect(() => {
    if (id) markViewed(id)
  }, [id, markViewed])
}

export const QUESTION_GOAL = 10

/** The four "before you start" steps, each ticked by what the visitor has
 * actually done. */
export function useChecklist() {
  const { viewed } = useViewed()
  const ids = Object.keys(viewed)
  const questionsOpened = ids.filter((k) => k.startsWith('progress.question.')).length

  return [
    { label: 'Learn the role', to: '/role', done: Boolean(viewed['progress.role']) },
    { label: 'Pick a method', to: '/methods', done: ids.some((k) => k.startsWith('progress.method.')) },
    {
      label: 'Do ten questions',
      to: '/browse',
      done: questionsOpened >= QUESTION_GOAL,
      count: `${Math.min(questionsOpened, QUESTION_GOAL)}/${QUESTION_GOAL}`,
    },
    { label: 'Run flashcards', to: '/flashcards', done: Boolean(viewed['progress.flashcards']) },
  ]
}
