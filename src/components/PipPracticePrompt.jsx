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
 * Pip's practice-step nudge: springs in from the bottom edge once a topic's
 * Practice step becomes active, with a speech bubble and a button to the
 * question. Dismissible; shows at most once per topic per browser session.
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
          initial={reduce ? false : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm items-start gap-3 rounded-panel border border-border bg-surface p-3 shadow-soft"
          role="status"
        >
          <Pip mood="excited" size={48} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-text">Your turn — try this one.</p>
            <Link
              to={`/browse/${questionId}`}
              className="btn btn-primary btn-sm mt-2 no-underline hover:no-underline"
              onClick={() => setDismissed(true)}
            >
              Open question
            </Link>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="grid size-8 shrink-0 place-items-center rounded-button text-text-muted hover:text-text"
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
