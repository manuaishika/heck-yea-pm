import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useViewed } from '../lib/useViewed'

/** A node's dot: hollow until its card has been scrolled into view, then fills. */
function NodeDot({ id, className = '' }) {
  const { isViewed } = useViewed()
  return (
    <span
      aria-hidden="true"
      className={`z-10 size-3.5 shrink-0 rounded-pill border-2 bg-surface ${
        isViewed(id) ? 'border-accent bg-accent' : 'border-border'
      } ${className}`}
    />
  )
}

/** One stage card. Marks itself viewed once ~60% on screen for a beat. */
function StageCard({ id, label, children }) {
  const { markViewed } = useViewed()
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
    <div ref={ref} className="card p-3">
      <p className="label">{label}</p>
      <div className="mt-1 text-text">{children}</div>
    </div>
  )
}

function DetailStage({ id, label, lead, detail }) {
  const [open, setOpen] = useState(false)
  return (
    <StageCard id={id} label={label}>
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

function PracticeStage({ id, question, fallback }) {
  return (
    <StageCard id={id} label="Practice">
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
 * down the left edge.
 *
 * @param {{
 *   slug: string, name: string, gist: string, howItWorks: string,
 *   need: string[], question?: object, fallback: string,
 * }} props
 */
export default function Flowchart({ slug, name, gist, howItWorks, need, question, fallback }) {
  const ids = [`${slug}.what`, `${slug}.how`, `${slug}.pm`, `${slug}.practice`]
  const stages = [
    { id: ids[0], node: <StageCard id={ids[0]} label="What it is"><p>{gist}</p></StageCard> },
    { id: ids[1], node: <StageCard id={ids[1]} label="How it works"><p>{howItWorks}</p></StageCard> },
    { id: ids[2], node: <DetailStage id={ids[2]} label="What a PM needs to know" lead={need[0]} detail={need} /> },
    { id: ids[3], node: <PracticeStage id={ids[3]} question={question} fallback={fallback} /> },
  ]

  return (
    <section className="mt-4">
      <h3 className="text-body font-semibold text-text">{name}</h3>

      {/* desktop: zigzag either side of a centre line */}
      <div className="relative mt-3 hidden sm:block">
        <span aria-hidden="true" className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-border" />
        <ol className="space-y-4">
          {stages.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[1fr_2rem_1fr] items-center gap-x-0">
              <div className={i % 2 === 0 ? 'col-start-1 pr-4' : 'invisible'}>{i % 2 === 0 && s.node}</div>
              <div className="flex justify-center">
                <NodeDot id={s.id} />
              </div>
              <div className={i % 2 === 1 ? 'col-start-3 pl-4' : 'invisible'}>{i % 2 === 1 && s.node}</div>
            </li>
          ))}
        </ol>
      </div>

      {/* phones: one column, line and nodes down the left edge */}
      <div className="relative mt-3 pl-8 sm:hidden">
        <span aria-hidden="true" className="absolute left-[6px] top-2 bottom-2 w-px bg-border" />
        <ol className="space-y-3">
          {stages.map((s) => (
            <li key={s.id} className="relative">
              <NodeDot id={s.id} className="absolute -left-8 top-4" />
              {s.node}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
