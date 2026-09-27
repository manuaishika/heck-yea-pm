import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Numbered placards that stack as you scroll: each one sticks a header's
 * height below the one before, so the next placard slides up over it and
 * leaves its number and title showing. Scroll to the end and every header
 * sits in a pile, one tint deeper than the last. Plain sticky CSS, so it
 * works without JS; the body copy fades up once as each card arrives.
 *
 * @param {{ items: {
 *   slug: string, name: string, gist: string, howItWorks: string,
 *   need: string[], question?: { id: string, question: string } | null,
 * }[], fallback: string }} props
 */

// top of the stack sits just under the sticky nav; each header is STEP tall
const NAV = 72
const STEP = 60

const tint = (i, n) => `color-mix(in srgb, var(--block-blue) ${14 + Math.round((i / Math.max(n - 1, 1)) * 48)}%, var(--paper))`

export default function Placards({ items, fallback }) {
  const reduce = useReducedMotion()
  const n = items.length

  return (
    <ol className="relative">
      {items.map((t, i) => (
        <li
          key={t.slug}
          id={t.slug}
          className="sticky scroll-mt-24 border border-ink text-ink"
          style={{ top: NAV + i * STEP, background: tint(i, n), marginBottom: i < n - 1 ? '28vh' : 0 }}
        >
          <div className="flex items-center gap-4 px-4 sm:px-6" style={{ height: STEP }}>
            <span className="w-12 shrink-0 font-sans text-[2rem] font-light leading-none tabular-nums sm:w-16 sm:text-[2.5rem]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h2 className="min-w-0 flex-1 truncate font-sans text-body font-semibold normal-case tracking-normal sm:text-center sm:text-section">
              {t.name}
            </h2>
            <span className="hidden w-16 sm:block" aria-hidden="true" />
          </div>

          <motion.div
            className="border-t border-ink/30 px-4 pb-6 pt-4 sm:px-6 sm:pl-26"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="text-section font-semibold leading-tight">{t.gist}</p>
            <p className="mt-2 text-ink/80">{t.howItWorks}</p>
            <ul className="mt-4 space-y-2">
              {t.need.map((p) => (
                <li key={p} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-ink" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link
              to={t.question ? `/browse/${t.question.id}` : fallback}
              className="btn btn-sm mt-5 max-w-full border-ink bg-card text-left no-underline hover:no-underline"
            >
              <span className="truncate">Practise: {t.question ? t.question.question : 'AI questions in the bank'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </li>
      ))}
    </ol>
  )
}
