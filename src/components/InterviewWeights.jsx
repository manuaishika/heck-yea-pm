import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, role } from '../data/guides'
import { categoryCounts, categorySlug } from '../data/questions'
import { methods } from '../lib/methods'
import { useInView, prefersReducedMotion } from '../lib/useInView'

/**
 * "What the interview weighs": a donut built from companies.json — every
 * loop with a sourced round weighting, heavy 3 / medium 2 / light 1, summed
 * per area. Tap a company and the ring re-weighs itself to that one loop;
 * tap a slice or a legend row for what that area tests, which methods fit
 * it, and its questions. Slices draw in once on screen and the highlight
 * cycles on its own until the visitor touches anything.
 *
 * Ink tints per area, block-blue for the one selected — the same rule the
 * method diagrams follow.
 */

const SCORE = { heavy: 3, medium: 2, light: 1 }
const LOOPS = companies.filter((c) => c.weights?.length)
const AREAS = role.interviewWeights.areas
const COUNTS = categoryCounts()

const TINTS = [
  'var(--ink)',
  'color-mix(in srgb, var(--ink) 80%, var(--card))',
  'color-mix(in srgb, var(--ink) 62%, var(--card))',
  'color-mix(in srgb, var(--ink) 44%, var(--card))',
  'color-mix(in srgb, var(--ink) 28%, var(--card))',
]
const onTint = (i) => (i < 3 ? 'var(--card)' : 'var(--ink)')

const R = 78
const C = 2 * Math.PI * R
const GAP = 3

function weigh(loops) {
  const totals = Object.fromEntries(AREAS.map((a) => [a.category, 0]))
  for (const c of loops) for (const [cat, level] of c.weights) if (cat in totals) totals[cat] += SCORE[level]
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1
  let cursor = 0
  return AREAS.map((a, i) => {
    const share = totals[a.category] / sum
    const start = cursor
    cursor += share
    return { ...a, i, share, start }
  })
}

const pct = (x) => `${Math.round(x * 100)}%`

export default function InterviewWeights() {
  const [ref, inView] = useInView(0.3)
  const [scope, setScope] = useState('all')
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)

  const loops = scope === 'all' ? LOOPS : LOOPS.filter((c) => c.slug === scope)
  const slices = weigh(loops)
  const max = Math.max(...slices.map((s) => s.share))
  const current = slices[active]

  useEffect(() => {
    if (!inView || !auto || prefersReducedMotion()) return undefined
    const id = setInterval(() => setActive((a) => (a + 1) % AREAS.length), 2400)
    return () => clearInterval(id)
  }, [inView, auto])

  function pick(i) {
    setAuto(false)
    setActive(i)
  }

  const heavyAt = LOOPS.filter((c) => c.weights.some(([cat, l]) => cat === current.category && l === 'heavy'))
  const fits = methods.filter((m) => m.categories.includes(current.category))

  return (
    <div ref={ref}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" aria-pressed={scope === 'all'} onClick={() => setScope('all')} className="pill shrink-0">
          All {LOOPS.length} loops
        </button>
        {LOOPS.map((c) => (
          <button
            key={c.slug}
            type="button"
            aria-pressed={scope === c.slug}
            onClick={() => setScope(scope === c.slug ? 'all' : c.slug)}
            className="pill shrink-0"
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,15rem)_1fr]">
        <svg viewBox="0 0 200 200" className="mx-auto block w-full max-w-[15rem]" role="img" aria-label={`What ${scope === 'all' ? 'PM loops' : loops[0].name} weigh: ${slices.map((s) => `${s.label} ${pct(s.share)}`).join(', ')}`}>
          <g transform="rotate(-90 100 100)">
            {slices.map((s) => {
              const len = inView ? Math.max(s.share * C - GAP, 0) : 0
              const on = s.i === active
              return (
                <circle
                  key={s.category}
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke={on ? 'var(--block-blue)' : TINTS[s.i]}
                  strokeWidth={on ? 38 : 30}
                  strokeDasharray={`${len} ${C}`}
                  strokeDashoffset={-s.start * C}
                  pointerEvents="stroke"
                  onClick={() => pick(s.i)}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease, stroke-width 200ms ease, stroke 200ms ease',
                  }}
                />
              )
            })}
          </g>
          {slices.map((s) => {
            if (s.share < 0.1 || !inView) return null
            const a = (s.start + s.share / 2) * 2 * Math.PI - Math.PI / 2
            const x = 100 + R * Math.cos(a)
            const y = 100 + R * Math.sin(a)
            return (
              <text
                key={`t-${s.category}`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="700"
                fill={s.i === active ? 'var(--card)' : onTint(s.i)}
                style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 700ms ease', pointerEvents: 'none' }}
              >
                {pct(s.share)}
              </text>
            )
          })}
          <text x="100" y="94" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--text)">
            {pct(current.share)}
          </text>
          <text x="100" y="114" textAnchor="middle" fontSize="11" fill="var(--text-muted)">
            {current.label}
          </text>
        </svg>

        <ul className="space-y-1">
          {slices.map((s) => {
            const on = s.i === active
            return (
              <li key={s.category}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(s.i)}
                  className={`flex min-h-11 w-full items-center gap-3 border px-3 text-left ${on ? 'border-accent bg-surface' : 'border-transparent'}`}
                >
                  <span aria-hidden="true" className="size-3 shrink-0" style={{ background: on ? 'var(--block-blue)' : TINTS[s.i] }} />
                  <span className="w-32 shrink-0 whitespace-nowrap font-semibold text-text">{s.label}</span>
                  <span className="h-2 min-w-0 flex-1 bg-border/50">
                    <span
                      className="block h-full"
                      style={{
                        width: `${(s.share / max) * 100}%`,
                        background: on ? 'var(--block-blue)' : TINTS[s.i],
                        transition: 'width 700ms ease',
                      }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums text-text">{pct(s.share)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="card mt-4 p-4" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold text-text">{current.label}</p>
          <Link to={`/browse?category=${categorySlug(current.category)}`} className="label !text-accent">
            {COUNTS[current.category]} questions →
          </Link>
        </div>
        <p className="mt-1 text-text-muted">{current.tests}</p>
        {heavyAt.length > 0 && (
          <p className="mt-3 text-text-muted">
            <span className="label">Heavy at</span>{' '}
            {heavyAt.map((c, k) => (
              <span key={c.slug}>
                {k > 0 && ', '}
                <Link to={`/companies/${c.slug}`}>{c.name}</Link>
              </span>
            ))}
          </p>
        )}
        {fits.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {fits.map((m) => (
              <li key={m.slug}>
                <Link to={`/methods/${m.slug}`} className="pill">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-label text-text-muted">{role.interviewWeights.note}</p>
    </div>
  )
}
