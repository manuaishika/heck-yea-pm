import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Pip from './Pip'

const shownKey = (slug) => `hyp.pip-shown.${slug}`

function alreadyShown(slug) {
  try {
    return sessionStorage.getItem(shownKey(slug)) === '1'
  } catch {
    return false
  }
}
function markShown(slug) {
  try {
    sessionStorage.setItem(shownKey(slug), '1')
  } catch {
    /* private browsing — just don't persist, harmless */
  }
}

/**
 * Pip's practice-step nudge: springs in once a topic's Practice step becomes
 * active, with a speech bubble and a button to the question. Dismissible;
 * shows at most once per topic per browser session.
 *
 * Position: docked to the bottom edge everywhere up to 2xl (1536px) — below
 * that width the page's own 1200px-wide content column leaves no real dead
 * space beside it, so a fixed side bubble would sit on top of the flow's
 * text. Only at 2xl+, where the column's outer margin is reliably >150px,
 * does it move into that side gutter instead. AI.jsx reserves matching
 * bottom padding (below 2xl) so the docked bubble never covers the page's
 * last section.
 */
export default function PipPracticePrompt({ slug, active, questionId }) {
  const reduce = useReducedMotion()
  const [dismissed, setDismissed] = useState(false)
  const [everShown, setEverShown] = useState(false)

  useEffect(() => {
    if (active && !alreadyShown(slug) && !everShown) {
      markShown(slug)
      setEverShown(true)
    }
  }, [active, slug, everShown])

  const visible = active && everShown && !dismissed && questionId

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm items-start gap-3 rounded-panel border border-border bg-surface p-3 shadow-soft
                     2xl:inset-x-auto 2xl:bottom-auto 2xl:right-6 2xl:top-1/2 2xl:mx-0 2xl:max-w-[220px] 2xl:-translate-y-1/2 2xl:flex-col"
          role="status"
        >
          <div className="flex items-start gap-3 2xl:contents">
            <Pip mood="excited" size={48} className="shrink-0" />
            <div className="min-w-0 flex-1 2xl:mt-2 2xl:w-full">
              <p className="text-text">Your turn — try this one.</p>
              <Link
                to={`/browse/${questionId}`}
                className="btn btn-primary btn-sm mt-2 no-underline hover:no-underline 2xl:w-full 2xl:justify-center"
                onClick={() => setDismissed(true)}
              >
                Open question
              </Link>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="grid size-8 shrink-0 place-items-center rounded-button text-text-muted hover:text-text 2xl:absolute 2xl:-right-1 2xl:-top-1 2xl:bg-surface"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
