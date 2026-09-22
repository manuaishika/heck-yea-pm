import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const W = 440
const H = 330
const CX = W / 2
const CY = 165
const R = 105 // radius of the outermost ring (level 3)
const MAX = 3
const AUTOPLAY_MS = 2600

/**
 * How the three company types differ, as a radar: one shape per type, one axis
 * per dimension. Further from the centre means more of it.
 *
 * Series are told apart by colour AND line style, so it survives greyscale and
 * colour-blindness: accent solid, text-colour solid, text-colour dashed with hollow markers.
 * The table below it (ModeMatrix) is the accessible, exact view of the same data.
 *
 * Tap a legend btn btn-sm to isolate one type; hover, focus or tap an axis to read
 * what each type is like on it. The chart springs into view once, cycles the
 * highlighted axis on its own until you touch it, and each marker drifts a
 * couple of px at rest — all skipped under prefers-reduced-motion.
 *
 * @param {{ modes: import('../../data/guides').careers['modes'] }} props
 */
export default function ModeRadar({ modes }) {
  const { columns, bars } = modes
  const reduce = useReducedMotion()
  const [only, setOnly] = useState(null) // isolate one mode
  const [dim, setDim] = useState(0) // axis being read
  const [autoplay, setAutoplay] = useState(!reduce)
  const stopAutoplay = useRef(() => setAutoplay(false))

  useEffect(() => {
    if (!autoplay) return undefined
    const id = setInterval(() => setDim((d) => (d + 1) % bars.length), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [autoplay, bars.length])

  const pickDim = (i) => {
    stopAutoplay.current()
    setDim(i)
  }

  const n = bars.length
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const at = (i, level) => [
    CX + Math.cos(angle(i)) * R * (level / MAX),
    CY + Math.sin(angle(i)) * R * (level / MAX),
  ]
  const ring = (level) => bars.map((_, i) => at(i, level).join(',')).join(' ')

  const series = columns.map((c, m) => ({
    key: c.key,
    name: c.name,
    sub: c.sub,
    points: bars.map((b, i) => at(i, b.levels[m])),
  }))

  // per-series look: colour + dash + marker shape
  const look = [
    { stroke: 'var(--accent)', fill: 'var(--accent)', fillOpacity: 0.16, dash: undefined, marker: 'circle' },
    { stroke: 'var(--text)', fill: 'none', fillOpacity: 0, dash: undefined, marker: 'circle' },
    { stroke: 'var(--text)', fill: 'none', fillOpacity: 0, dash: '7 5', marker: 'square' },
  ]

  const dimensionLabel = (i) => {
    const words = bars[i].dim.split(' ')
    const mid = Math.ceil(words.length / 2)
    return words.length > 2 ? [words.slice(0, mid).join(' '), words.slice(mid).join(' ')] : [bars[i].dim]
  }

  return (
    <div className="mt-3">
      {/* legend: also the isolate control */}
      <ul className="flex flex-wrap gap-2" aria-label="Company types">
        {series.map((s, m) => (
          <li key={s.key}>
            <button
              type="button"
              aria-pressed={only === m}
              onClick={() => {
                stopAutoplay.current()
                setOnly(only === m ? null : m)
              }}
              className="btn btn-sm !py-1"
            >
              <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
                <line
                fill="none"
                  x1="1"
                  y1="5"
                  x2="25"
                  y2="5"
                  stroke={only === m ? 'currentColor' : look[m].stroke}
                  strokeWidth="2.5"
                  strokeDasharray={look[m].dash}
                />
                {look[m].marker === 'circle' ? (
                  <circle cx="13" cy="5" r="3.5" fill={only === m ? 'currentColor' : look[m].stroke} />
                ) : (
                  <rect x="9.5" y="1.5" width="7" height="7" fill="var(--surface)" stroke={only === m ? 'currentColor' : look[m].stroke} strokeWidth="2" />
                )}
              </svg>
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      <motion.svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto mt-2 block w-full max-w-[30rem]"
        role="img"
        aria-label={`Radar chart comparing ${series.map((s) => s.name).join(', ')} across ${bars
          .map((b) => b.dim)
          .join(', ')}. The table below has the exact values.`}
        initial={reduce ? false : { opacity: 0, scale: 0.86 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        {/* rings + spokes: recessive */}
        {[1, 2, 3].map((lv) => (
          <polygon
            key={lv}
            points={ring(lv)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={lv === MAX ? 1.5 : 1}
          />
        ))}
        {bars.map((_, i) => {
          const [x, y] = at(i, MAX)
          return (
            <line
                fill="none"
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke={i === dim ? 'var(--text)' : 'var(--border)'}
              strokeWidth={i === dim ? 2 : 1}
            />
          )
        })}

        {/* series */}
        {series.map((s, m) => {
          const faded = only !== null && only !== m
          return (
            <g key={s.key} fill="currentColor" opacity={faded ? 0.15 : 1} style={{ transition: 'opacity 150ms' }}>
              <polygon
                points={s.points.map((p) => p.join(',')).join(' ')}
                fill={look[m].fill}
                fillOpacity={look[m].fillOpacity}
                stroke={look[m].stroke}
                strokeWidth="2.5"
                strokeDasharray={look[m].dash}
                strokeLinejoin="round"
              />
              {s.points.map(([x, y], i) => {
                const markerProps = {
                  fill: look[m].stroke,
                  stroke: 'var(--surface)',
                  strokeWidth: 2,
                }
                // gentle idle drift: a couple of px, staggered so markers don't move in lockstep
                const driftAnim = reduce
                  ? undefined
                  : { x: [0, (i % 2 ? 1 : -1) * 2, 0], y: [0, (m % 2 ? -1 : 1) * 2, 0] }
                const driftTransition = reduce
                  ? undefined
                  : { duration: 4 + i * 0.4 + m * 0.3, repeat: Infinity, ease: 'easeInOut' }
                return look[m].marker === 'circle' ? (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4.5"
                    animate={driftAnim}
                    transition={driftTransition}
                    {...markerProps}
                  />
                ) : (
                  <motion.rect
                    key={i}
                    x={x - 4.5}
                    y={y - 4.5}
                    width="9"
                    height="9"
                    animate={driftAnim}
                    transition={driftTransition}
                    fill="var(--surface)"
                    stroke={look[m].stroke}
                    strokeWidth="2"
                  />
                )
              })}
            </g>
          )
        })}

        {/* axis labels: the interactive part */}
        {bars.map((b, i) => {
          const cos = Math.cos(angle(i))
          const sin = Math.sin(angle(i))
          const lx = CX + cos * (R + 16)
          const ly = CY + sin * (R + 16)
          const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle'
          const lines = dimensionLabel(i)
          const on = i === dim
          return (
            <g
              key={b.dim}
              fill="currentColor"
              role="button"
              tabIndex={0}
              aria-label={`${b.dim}: show how each company type compares`}
              aria-pressed={on}
              onClick={() => pickDim(i)}
              onMouseEnter={() => pickDim(i)}
              onFocus={() => pickDim(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pickDim(i)
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <text
                x={lx}
                y={ly - (lines.length - 1) * 6 + (sin > 0.5 ? 8 : sin < -0.5 ? -2 : 4)}
                textAnchor={anchor}
                fontFamily="var(--font-sans)"
                fontSize="14"
                fontWeight={on ? 700 : 500}
                fill="var(--text)"
                textDecoration={on ? 'underline' : 'none'}
              >
                {lines.map((ln, k) => (
                  <tspan key={k} x={lx} dy={k === 0 ? 0 : 13}>
                    {ln}
                  </tspan>
                ))}
              </text>
              {/* generous hit area */}
              <circle cx={lx} cy={ly} r="30" fill="transparent" />
            </g>
          )
        })}

        <text
          x={CX + 4}
          y={CY + R * 0.34 + 1}
          fontFamily="var(--font-sans)"
          fontSize="9"
          fill="var(--text-muted)"
        >
          less
        </text>
        <text
          x={CX + 8}
          y={CY - R + 14}
          fontFamily="var(--font-sans)"
          fontSize="9"
          fill="var(--text-muted)"
        >
          more
        </text>
      </motion.svg>

      {/* reading of the chosen axis */}
      <div className="card mt-1 p-3" aria-live="polite">
        <p className="label !text-text">{bars[dim].dim}</p>
        <ul className="mt-2 space-y-1">
          {series.map((s, m) => (
            <li key={s.key} className="flex items-start gap-2 text-body">
              <svg width="18" height="12" viewBox="0 0 18 12" className="mt-1 shrink-0" aria-hidden="true">
                <line fill="none" x1="0" y1="6" x2="18" y2="6" stroke={look[m].stroke} strokeWidth="2.5" strokeDasharray={look[m].dash} />
              </svg>
              <span>
                <span className="font-semibold text-text">{s.name}:</span>{' '}
                <span className="text-text-muted">{bars[dim].labels[m]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
