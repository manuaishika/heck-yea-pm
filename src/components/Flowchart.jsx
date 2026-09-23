import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useViewed } from '../lib/useViewed'
import PipPracticePrompt from './PipPracticePrompt'

const SPRING = { type: 'spring', stiffness: 260, damping: 22 }
// the invisible trigger line: ~45% down the viewport
const TRIGGER_MARGIN = '-45% 0px -54% 0px'

/**
 * Scroll-spy for one flowchart: which of its N stages is "active" right
 * now, by watching each stage's element cross a line at ~45% of the
 * viewport. -1 = the trigger line hasn't reached the first stage yet;
 * N = it has passed the last one (everything's completed).
 */
function useActiveStage(refs) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const activeRef = useRef(-1)
  activeRef.current = activeIndex

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const els = refs.map((r) => r.current).filter(Boolean)
    if (els.length === 0) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = els.indexOf(entry.target)
          if (i === -1) continue
          if (entry.isIntersecting) {
            setActiveIndex(i)
          } else if (entry.boundingClientRect.top < 0 && activeRef.current === i) {
            // this stage has scrolled up past the trigger line — advance
            setActiveIndex(i + 1)
          } else if (entry.boundingClientRect.top > 0 && activeRef.current === i) {
            // scrolled back above it
            setActiveIndex(i - 1)
          }
        }
      },
      { rootMargin: TRIGGER_MARGIN, threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [refs])

  // fallback: the trigger line sits at ~45% down the viewport, so the last
  // stage only "advances" once its top scrolls above the viewport entirely
  // — if this flowchart is the last thing on the page (nothing below it to
  // scroll the page further), that can never happen and the final stage is
  // stuck "upcoming" forever. Once the visitor hits the bottom of the
  // document, force it to at least the last stage.
  useEffect(() => {
    const lastIndex = refs.length - 1
    function checkBottom() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) setActiveIndex((a) => Math.max(a, lastIndex))
    }
    checkBottom()
    window.addEventListener('scroll', checkBottom, { passive: true })
    window.addEventListener('resize', checkBottom)
    return () => {
      window.removeEventListener('scroll', checkBottom)
      window.removeEventListener('resize', checkBottom)
    }
  }, [refs])

  return activeIndex
}

/** A node's dot: hollow while upcoming, fills with a glow pulse when it
 * becomes active, fills with a check once completed (and persists that —
 * see useViewed — so a repeat visit shows real progress, not a re-animation). */
function NodeDot({ id, status, className = '' }) {
  const { isViewed, markViewed } = useViewed()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (status === 'completed') markViewed(id)
  }, [status, id, markViewed])

  const completed = status === 'completed' || isViewed(id)
  const active = status === 'active'

  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={
        reduce
          ? undefined
          : active
            ? { scale: [1, 1.35, 1], boxShadow: ['0 0 0 0 var(--accent)', '0 0 0 6px transparent', '0 0 0 0 transparent'] }
            : { scale: 1 }
      }
      transition={active ? { duration: 0.7, ease: 'easeOut' } : SPRING}
      className={`z-10 grid shrink-0 place-items-center rounded-pill border-2 ${
        completed
          ? 'size-4 border-accent bg-accent text-surface'
          : active
            ? 'size-4 border-accent bg-accent'
            : 'size-3.5 border-border bg-surface'
      } ${className}`}
    >
      {completed && (
        <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1.5 5.2 4 7.7 8.5 2.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.span>
  )
}

/** One stage card: collapsed to its summary while upcoming/completed, full
 * brightness and expanded to its deeper layer while active. Reduced motion
 * keeps the same state changes, just without the slide/scale animation. */
function StageCard({ elRef, id, label, side, status, summary, deeper }) {
  const reduce = useReducedMotion()
  const active = status === 'active'
  const upcoming = status === 'upcoming'

  return (
    <motion.div
      ref={elRef}
      className="card p-3"
      initial={reduce ? false : { opacity: 0, x: side === 'left' ? -14 : side === 'right' ? 14 : -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      animate={{
        opacity: upcoming && !reduce ? 0.45 : 1,
        scale: active && !reduce ? 1.03 : 1,
      }}
      transition={SPRING}
    >
      <p className="label">{label}</p>
      <div className="mt-1 text-text">{summary}</div>
      {active && deeper && <div className="mt-2 border-t border-border pt-2 text-text-muted">{deeper}</div>}
    </motion.div>
  )
}

/**
 * A topic as a 4-stage flow: what it is → how it works → what a PM needs to
 * know → a practice question. Desktop: cards alternate left/right of a
 * centre line, a node at each junction. Mobile: one column, line and nodes
 * down the left edge.
 *
 * Motion is scroll-driven in two layers: the connecting line fills with
 * primary up to the active node (a spring-smoothed progress value drives
 * both the line and a travelling marker), and each stage's own status —
 * upcoming / active / completed — comes from a scroll-spy watching an
 * invisible trigger line at ~45% of the viewport (useActiveStage above).
 * Reaching a step's trigger line is what opens it: only the active card
 * expands to its deeper layer; completed ones collapse back to a summary.
 *
 * @param {{
 *   slug: string, name: string, gist: string, howItWorks: string,
 *   need: string[], question?: object, fallback: string,
 * }} props
 */
export default function Flowchart({ slug, name, gist, howItWorks, need, question, fallback }) {
  const reduce = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 0.85', 'end 0.35'] })
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 32, restDelta: 0.001 })

  const ids = useMemo(() => [`${slug}.what`, `${slug}.how`, `${slug}.pm`, `${slug}.practice`], [slug])
  const ref0 = useRef(null)
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)
  // a stable array wrapper — the ref objects themselves never change
  // identity, but a bare array literal would, re-running the observer setup
  // on every render
  const refs = useMemo(() => [ref0, ref1, ref2, ref3], []) // eslint-disable-line react-hooks/exhaustive-deps
  const activeIndex = useActiveStage(refs)
  const statusOf = (i) => (i < activeIndex ? 'completed' : i === activeIndex ? 'active' : 'upcoming')

  const stages = [
    { id: ids[0], side: 'left', label: 'What it is', summary: <p>{gist}</p> },
    { id: ids[1], side: 'right', label: 'How it works', summary: <p>{howItWorks}</p> },
    {
      id: ids[2],
      side: 'left',
      label: 'What a PM needs to know',
      summary: <p>{need[0]}</p>,
      deeper: (
        <ul className="space-y-1.5">
          {need.slice(1).map((d, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-text-muted" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: ids[3],
      side: 'right',
      label: 'Practice',
      summary: question ? (
        <Link to={`/browse/${question.id}`} className="font-semibold text-accent no-underline hover:underline">
          {question.question}
        </Link>
      ) : (
        <Link to={fallback} className="font-semibold text-accent no-underline hover:underline">
          Related questions in the bank
        </Link>
      ),
      deeper: question && (
        <ul className="space-y-1.5">
          {question.sections[0]?.points.slice(0, 3).map((p, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-text-muted" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <section className="mt-4" ref={containerRef}>
      <h3 className="text-body font-semibold text-text">{name}</h3>

      <ol className="relative mt-3 overflow-x-hidden">
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-[6px] top-2 w-px bg-border sm:bottom-6 sm:left-1/2 sm:top-6 sm:-translate-x-1/2"
        />
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute bottom-2 left-[6px] top-2 w-px origin-top bg-accent sm:bottom-6 sm:left-1/2 sm:top-6 sm:-translate-x-1/2"
          />
        )}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ top: progress }}
            className="absolute left-[6px] z-20 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-accent sm:left-1/2"
          />
        )}

        {stages.map((s, i) => {
          const status = statusOf(i)
          return (
            <li
              key={s.id}
              className="relative py-1.5 pl-8 sm:grid sm:grid-cols-[1fr_2rem_1fr] sm:items-center sm:gap-x-0 sm:pl-0"
            >
              <NodeDot
                id={s.id}
                status={status}
                className="absolute -left-8 top-4 sm:static sm:col-start-2 sm:mx-auto sm:left-auto sm:top-auto"
              />
              <div className={i % 2 === 0 ? 'sm:col-start-1 sm:pr-4' : 'sm:col-start-3 sm:pl-4'}>
                <StageCard elRef={refs[i]} id={s.id} label={s.label} side={s.side} status={status} summary={s.summary} deeper={s.deeper} />
              </div>
            </li>
          )
        })}
      </ol>

      <PipPracticePrompt slug={slug} active={statusOf(3) === 'active'} questionId={question?.id} />
    </section>
  )
}
