import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useViewed } from '../lib/useViewed'

const SPRING = { type: 'spring', stiffness: 260, damping: 22 }

/** A node's dot: springs in with a slight overshoot once the travelling
 * marker reaches it; fills once its card has actually been viewed
 * (persisted — see useViewed), not just animated in for the session. */
function NodeDot({ id, threshold, progress, className = '' }) {
  const { isViewed } = useViewed()
  const controls = useAnimation()
  const reduce = useReducedMotion()
  const fired = useRef(false)

  useMotionValueEvent(progress, 'change', (v) => {
    if (!fired.current && v >= threshold) {
      fired.current = true
      if (!reduce) controls.start({ scale: [0.5, 1.2, 1] })
    }
  })

  return (
    <motion.span
      aria-hidden="true"
      animate={controls}
      transition={SPRING}
      initial={{ scale: reduce ? 1 : 0.5 }}
      className={`z-10 size-3.5 shrink-0 rounded-pill border-2 bg-surface ${
        isViewed(id) ? 'border-accent bg-accent' : 'border-border'
      } ${className}`}
    />
  )
}

/** One stage card. Marks itself viewed once ~60% on screen; slides in from
 * its side as it enters the viewport. */
function StageCard({ id, label, side, children }) {
  const { markViewed } = useViewed()
  const reduce = useReducedMotion()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markViewed(id)
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [id, markViewed])

  return (
    <motion.div
      ref={ref}
      className="card p-3"
      initial={reduce ? false : { opacity: 0, x: side === 'left' ? -20 : side === 'right' ? 20 : -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={SPRING}
    >
      <p className="label">{label}</p>
      <div className="mt-1 text-text">{children}</div>
    </motion.div>
  )
}

function DetailStage({ id, side, label, lead, detail }) {
  const [open, setOpen] = useState(false)
  return (
    <StageCard id={id} label={label} side={side}>
      <p>{lead}</p>
      {detail && (
        <>
          <button
            type="button"
            className="label mt-2 text-accent"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Less' : 'More'}
          </button>
          {open && (
            <ul className="mt-2 space-y-1.5">
              {detail.map((d, i) => (
                <li key={i} className="flex gap-2 text-text-muted">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-text-muted" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </StageCard>
  )
}

function PracticeStage({ id, side, question, fallback }) {
  return (
    <StageCard id={id} label="Practice" side={side}>
      {question ? (
        <Link to={`/browse/${question.id}`} className="font-semibold text-accent no-underline hover:underline">
          {question.question}
        </Link>
      ) : (
        <Link to={fallback} className="font-semibold text-accent no-underline hover:underline">
          Related questions in the bank
        </Link>
      )}
    </StageCard>
  )
}

/**
 * A topic as a 4-stage flow: what it is → how it works → what a PM needs to
 * know → a practice question. Desktop: cards alternate left/right of a
 * centre line, a node at each junction. Mobile: one column, line and nodes
 * down the left edge. Motion is scroll-driven: the line draws itself as the
 * section scrolls through view, a spring-smoothed marker travels it, and
 * each node springs in (slight overshoot) as the marker reaches it.
 *
 * @param {{
 *   slug: string, name: string, gist: string, howItWorks: string,
 *   need: string[], question?: object, fallback: string,
 * }} props
 */
export default function Flowchart({ slug, name, gist, howItWorks, need, question, fallback }) {
  const reduce = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.35'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 32, restDelta: 0.001 })

  const ids = [`${slug}.what`, `${slug}.how`, `${slug}.pm`, `${slug}.practice`]
  const N = ids.length
  const stages = [
    { id: ids[0], side: 'left', node: <StageCard id={ids[0]} label="What it is" side="left"><p>{gist}</p></StageCard> },
    { id: ids[1], side: 'right', node: <StageCard id={ids[1]} label="How it works" side="right"><p>{howItWorks}</p></StageCard> },
    { id: ids[2], side: 'left', node: <DetailStage id={ids[2]} side="left" label="What a PM needs to know" lead={need[0]} detail={need} /> },
    { id: ids[3], side: 'right', node: <PracticeStage id={ids[3]} side="right" question={question} fallback={fallback} /> },
  ]

  return (
    <section className="mt-4" ref={containerRef}>
      <h3 className="text-body font-semibold text-text">{name}</h3>

      {/* desktop: zigzag either side of a centre line */}
      <div className="relative mt-3 hidden sm:block">
        <span aria-hidden="true" className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-border" />
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute left-1/2 top-6 bottom-6 w-px origin-top -translate-x-1/2 bg-accent"
          />
        )}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ top: progress }}
            className="absolute left-1/2 z-20 size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-accent"
          />
        )}
        <ol className="space-y-4">
          {stages.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[1fr_2rem_1fr] items-center gap-x-0">
              <div className={i % 2 === 0 ? 'col-start-1 pr-4' : 'invisible'}>{i % 2 === 0 && s.node}</div>
              <div className="flex justify-center">
                <NodeDot id={s.id} threshold={i / (N - 1)} progress={progress} />
              </div>
              <div className={i % 2 === 1 ? 'col-start-3 pl-4' : 'invisible'}>{i % 2 === 1 && s.node}</div>
            </li>
          ))}
        </ol>
      </div>

      {/* phones: one column, line and nodes down the left edge */}
      <div className="relative mt-3 pl-8 sm:hidden">
        <span aria-hidden="true" className="absolute left-[6px] top-2 bottom-2 w-px bg-border" />
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute left-[6px] top-2 bottom-2 w-px origin-top bg-accent"
          />
        )}
        <ol className="space-y-3">
          {stages.map((s, i) => (
            <li key={s.id} className="relative">
              <NodeDot id={s.id} threshold={i / (N - 1)} progress={progress} className="absolute -left-8 top-4" />
              {s.node}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
