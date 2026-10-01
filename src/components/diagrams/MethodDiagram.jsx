import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAutoStep, useInView } from '../../lib/useInView'
import ProgressFill from '../ProgressFill'

/**
 * Every answering method's main element: a diagram shaped for that
 * framework (a chain for STAR, a wheel for CIRCLES, a funnel for AARRR …)
 * that is always in motion. Once on screen it steps through the method by
 * itself — the current part lights up in block-blue and a caption under it
 * says what that part means — while connectors flow and rings turn. Tap any
 * part to stop on it; the play button resumes. Under reduced motion nothing
 * moves by itself and tapping is the only way through.
 *
 * Ink and paper, with block-blue for the current part only.
 */

const STEP_MS = 3200

function pickProps(i, active, pick, label) {
  return {
    onClick: () => pick(i),
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': active === i,
    style: { cursor: 'pointer' },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        pick(i)
      }
    },
  }
}

const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

const fillFor = (on) => (on ? 'var(--block-blue)' : 'var(--card)')
const inkFor = (on) => (on ? 'var(--on-blue)' : 'var(--ink)')

/* ------------------------------------------------------------- the frame
 * Runs the clock, draws the progress segments, the play/pause control and
 * the caption. `drawn` = how many parts the shape itself draws; any parts
 * after that sit in a row of chips under it, so no step is left out.
 */
function Motion({ parts, drawn = parts.length, label, children }) {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView(0.3)
  const [paused, setPaused] = useState(false)
  // true after a tap on a part: the bar shows that part as reached, and
  // playing again starts it fresh
  const [held, setHeld] = useState(false)
  const running = inView && !paused && !reduce
  const [active, jump, run] = useAutoStep(parts.length, STEP_MS, running)

  function pick(i) {
    jump(i)
    setPaused(true)
    setHeld(true)
  }

  function toggle() {
    setPaused((p) => !p)
    setHeld(false)
  }

  const part = parts[active]
  const extras = parts.slice(drawn)

  return (
    <div ref={ref} className={`diagram-enter ${inView ? 'in-view' : ''}`} aria-label={label}>
      {children(active, pick)}

      {extras.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {extras.map(([l], k) => {
            const i = drawn + k
            return (
              <li key={l}>
                <button type="button" aria-pressed={active === i} onClick={() => pick(i)} className="pill">
                  {l}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-5 flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {parts.map(([l], i) => (
            <button key={l} type="button" onClick={() => pick(i)} aria-label={l} className="flex h-6 flex-1 items-center">
              <span className="block h-1 w-full bg-border">
                {(i < active || (i === active && (held || reduce))) && <span className="block h-full bg-ink" />}
                {i === active && !held && !reduce && <ProgressFill run={run} ms={STEP_MS} playing={running} />}
              </span>
            </button>
          ))}
        </div>
        {!reduce && (
          <button
            type="button"
            onClick={toggle}
            aria-label={paused ? 'Play' : 'Pause'}
            className="grid size-11 shrink-0 place-items-center rounded-pill border border-border text-text hover:border-accent"
          >
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 2l11 6-11 6V2Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="2" width="4" height="12" fill="currentColor" />
                <rect x="9" y="2" width="4" height="12" fill="currentColor" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="relative mt-2 min-h-32" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="label">
              {active + 1} of {parts.length}
            </p>
            <p className="mt-1 text-section font-semibold leading-tight text-text">{part[0]}</p>
            <p className="mt-1 text-text-muted">{part[1]}</p>
            {part[2] && <p className="mt-1 text-text-muted">e.g. {part[2]}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- step chain
 * STAR, SBI, user → pain → solution → metrics: letter boxes in a row,
 * joined by connectors whose dashes flow toward the next step.
 */
function Chain({ steps, active, pick }) {
  return (
    <ol className="flex items-stretch gap-3 sm:gap-8">
      {steps.map(([label], i) => {
        const on = active === i
        const done = i < active
        return (
          <li key={label} className="relative flex min-w-0 flex-1">
            <button
              type="button"
              onClick={() => pick(i)}
              aria-pressed={on}
              className={`flex min-h-24 min-w-0 flex-1 flex-col items-center justify-center border border-ink px-1 py-3 transition-[background-color,color,transform] duration-300 ${
                on ? '-translate-y-1.5 bg-block-blue text-on-blue' : done ? 'bg-paper text-ink' : 'bg-card text-ink'
              }`}
            >
              <span className="font-display text-[2.5rem] leading-none sm:text-[3rem]">{label[0]}</span>
              <span className="mt-1 max-w-full text-center text-[0.6875rem] font-semibold leading-tight sm:text-body">{label}</span>
            </button>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="flow-line-x absolute top-1/2 left-full h-0.5 w-3 sm:w-8" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------- wheel
 * CIRCLES: seven segments round a ring. The current one lifts outward and
 * its full word sits in the middle; a dot orbits the dashed outer ring.
 */
function Wheel({ steps, active, pick }) {
  const CX = 150
  const CY = 150
  const OUTER = 116
  const INNER = 60
  const GAP = 2.5
  const sweep = 360 / steps.length

  const sectorPath = (start, end) => {
    const s = start + GAP / 2
    const e = end - GAP / 2
    const [x1, y1] = polar(CX, CY, OUTER, s)
    const [x2, y2] = polar(CX, CY, OUTER, e)
    const [x3, y3] = polar(CX, CY, INNER, e)
    const [x4, y4] = polar(CX, CY, INNER, s)
    return `M ${x1} ${y1} A ${OUTER} ${OUTER} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER} ${INNER} 0 0 0 ${x4} ${y4} Z`
  }

  return (
    <svg viewBox="0 0 300 300" className="mx-auto block w-full max-w-sm" aria-hidden="true">
      <g className="spin-slow" style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <circle cx={CX} cy={CY} r={OUTER + 22} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 7" />
        <circle cx={CX} cy={CY - OUTER - 22} r="5" fill="var(--ink)" />
      </g>
      {steps.map(([label], i) => {
        const start = i * sweep
        const mid = start + sweep / 2
        const on = active === i
        const [dx, dy] = polar(0, 0, on ? 10 : 0, mid)
        const [lx, ly] = polar(CX, CY, (OUTER + INNER) / 2, mid)
        return (
          <g
            key={label}
            {...pickProps(i, active, pick, label)}
            style={{ cursor: 'pointer', transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 350ms ease' }}
          >
            <path d={sectorPath(start, start + sweep)} fill={fillFor(on)} stroke="var(--ink)" strokeWidth="1" style={{ transition: 'fill 300ms' }} />
            <text x={lx} y={ly + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill={inkFor(on)} style={{ pointerEvents: 'none' }}>
              {label[0]}
            </text>
          </g>
        )
      })}
      <text x={CX} y={CY + 2} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)">
        {steps[active]?.[0] ?? ''}
      </text>
      <text x={CX} y={CY + 18} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
        {active < steps.length ? `${active + 1} of ${steps.length}` : ''}
      </text>
    </svg>
  )
}

/* ----------------------------------------------------- hub + satellites
 * North Star: the metric in the middle, the rest orbiting; the spoke to
 * the current part flows.
 */
function HubSatellites({ steps, active, pick }) {
  const hubIndex = steps.findIndex(([l]) => l.toLowerCase().includes('north star'))
  const hub = hubIndex === -1 ? 0 : hubIndex
  const satellites = steps.map((s, i) => i).filter((i) => i !== hub)
  const CX = 180
  const CY = 160
  const R = 108

  return (
    <svg viewBox="0 0 360 320" className="mx-auto block w-full max-w-md" aria-hidden="true">
      {satellites.map((i, k) => {
        const [x, y] = polar(CX, CY, R, (360 / satellites.length) * k)
        const on = active === i
        return (
          <line
            key={`l-${i}`}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke={on ? 'var(--ink)' : 'var(--border)'}
            strokeWidth={on ? 2 : 1.5}
            className={on ? 'flow-dash' : ''}
          />
        )
      })}
      {satellites.map((i, k) => {
        const [x, y] = polar(CX, CY, R, (360 / satellites.length) * k)
        const on = active === i
        return (
          <g key={i} {...pickProps(i, active, pick, steps[i][0])}>
            <circle cx={x} cy={y} r={on ? 44 : 40} fill={fillFor(on)} stroke="var(--ink)" strokeWidth="1" style={{ transition: 'r 300ms, fill 300ms' }} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={inkFor(on)} style={{ pointerEvents: 'none' }}>
              {steps[i][0]}
            </text>
          </g>
        )
      })}
      <g {...pickProps(hub, active, pick, steps[hub][0])}>
        <circle cx={CX} cy={CY} r="50" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 5" className="spin-slow" style={{ transformOrigin: `${CX}px ${CY}px` }} />
        <circle cx={CX} cy={CY} r="44" fill={active === hub ? 'var(--block-blue)' : 'var(--ink)'} style={{ transition: 'fill 300ms' }} />
        <text x={CX} y={CY - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill={active === hub ? 'var(--on-blue)' : 'var(--card)'} style={{ pointerEvents: 'none' }}>
          North
        </text>
        <text x={CX} y={CY + 13} textAnchor="middle" fontSize="12" fontWeight="700" fill={active === hub ? 'var(--on-blue)' : 'var(--card)'} style={{ pointerEvents: 'none' }}>
          Star
        </text>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------- funnel
 * AARRR: five narrowing bands, with users dripping through the middle.
 */
function Funnel({ steps, active, pick }) {
  const n = steps.length
  const W = 320
  const rowH = 46
  const gap = 6
  const H = n * rowH + (n - 1) * gap
  const maxInset = W * 0.32

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-sm" aria-hidden="true">
      {steps.map(([label], i) => {
        const y = i * (rowH + gap)
        const inTop = (maxInset * i) / n
        const inBot = (maxInset * (i + 1)) / n
        const on = active === i
        return (
          <g key={label} {...pickProps(i, active, pick, label)}>
            <polygon
              points={`${inTop},${y} ${W - inTop},${y} ${W - inBot},${y + rowH} ${inBot},${y + rowH}`}
              fill={fillFor(on)}
              stroke="var(--ink)"
              strokeWidth="1"
              style={{ transition: 'fill 300ms' }}
            />
            <text x={W / 2} y={y + rowH / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={inkFor(on)} style={{ pointerEvents: 'none' }}>
              {label}
            </text>
          </g>
        )
      })}
      {[-1, 1, -1, 1].map((side, k) => (
        <circle key={k} cx={W / 2 + side * 54} cy="0" r="3" fill="var(--ink)" className="drip" style={{ animationDelay: `${k * 0.7}s`, '--drip': `${H}px` }} />
      ))}
    </svg>
  )
}

/* -------------------------------------------------------------- rows
 * HEART: one row per dimension, what it means beside it.
 */
function Rows({ steps, active, pick }) {
  return (
    <ul className="divide-y divide-border border border-ink">
      {steps.map(([label, detail], i) => {
        const on = active === i
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-pressed={on}
              className={`flex min-h-12 w-full items-center gap-3 px-3 text-left transition-colors duration-300 ${on ? 'bg-block-blue text-on-blue' : 'bg-card text-ink'}`}
            >
              <span className="w-8 shrink-0 font-display text-section leading-none">{label[0]}</span>
              <span className="w-28 shrink-0 font-semibold">{label}</span>
              <span className={`hidden min-w-0 flex-1 truncate sm:block ${on ? '' : 'text-text-muted'}`}>{detail}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* --------------------------------------------------------- nested circles
 * TAM/SAM/SOM: three concentric circles; the current one pings.
 */
function NestedCircles({ steps, active, pick }) {
  const CX = 150
  const CY = 150
  const radii = [130, 90, 48]

  return (
    <svg viewBox="0 0 300 300" className="mx-auto block w-full max-w-sm" aria-hidden="true">
      {steps.map(([label], i) => {
        const on = active === i
        return (
          <g key={label} {...pickProps(i, active, pick, label)}>
            <circle cx={CX} cy={CY} r={radii[i]} fill={fillFor(on)} stroke="var(--ink)" strokeWidth="1" style={{ transition: 'fill 300ms' }} />
            {on && (
              <circle cx={CX} cy={CY} r={radii[i]} fill="none" stroke="var(--block-blue)" strokeWidth="2" className="ping" style={{ transformOrigin: `${CX}px ${CY}px` }} />
            )}
          </g>
        )
      })}
      {steps.map(([label], i) => (
        <text key={`t-${label}`} x={CX} y={CY - radii[i] + 22} textAnchor="middle" fontSize="15" fontWeight="700" fill={inkFor(active === i)} style={{ pointerEvents: 'none' }}>
          {label}
        </text>
      ))}
    </svg>
  )
}

/* -------------------------------------------------------------- venn
 * 3Cs: three circles that drift in and out, the overlap at the centre.
 */
function Venn({ steps, active, pick }) {
  const circles = [
    { cx: 150, cy: 98 },
    { cx: 112, cy: 162 },
    { cx: 188, cy: 162 },
  ]
  const positions = [
    { x: 150, y: 20 },
    { x: 40, y: 244 },
    { x: 260, y: 244 },
  ]
  const overlap = steps[3]

  return (
    <svg viewBox="0 0 300 260" className="mx-auto block w-full max-w-sm" aria-hidden="true">
      {circles.map(({ cx, cy }, i) => {
        const on = active === i
        return (
          <g key={i} className="breathe" style={{ animationDelay: `${i * 0.8}s`, '--bx': `${(cx - 150) / 14}px`, '--by': `${(cy - 141) / 14}px` }}>
            <circle
              cx={cx}
              cy={cy}
              r="70"
              fill={on ? 'var(--block-blue)' : 'var(--ink)'}
              fillOpacity={on ? 0.55 : 0.1}
              stroke="var(--ink)"
              strokeWidth="1.25"
              {...pickProps(i, active, pick, steps[i][0])}
              style={{ cursor: 'pointer', transition: 'fill-opacity 300ms' }}
            />
          </g>
        )
      })}
      {positions.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)" style={{ pointerEvents: 'none' }}>
          {steps[i][0]}
        </text>
      ))}
      {overlap && (
        <g {...pickProps(3, active, pick, overlap[0])}>
          <circle cx="150" cy="141" r="20" fill={active === 3 ? 'var(--block-blue)' : 'var(--ink)'} style={{ transition: 'fill 300ms' }} />
          <text x="150" y="145" textAnchor="middle" fill={active === 3 ? 'var(--on-blue)' : 'var(--card)'} fontSize="9" fontWeight="700" style={{ pointerEvents: 'none' }}>
            {overlap[0]}
          </text>
        </g>
      )}
    </svg>
  )
}

/* --------------------------------------------------------------- tree
 * Metric drop: a straight run that forks at "internal vs external", then
 * converges on a hypothesis. Connectors flow downward.
 */
function DecisionTree({ steps, active, pick }) {
  const forkIndex = steps.findIndex(([l]) => /vs/i.test(l))
  const before = steps.slice(0, forkIndex)
  const cap = (w) => (w ? w.trim().charAt(0).toUpperCase() + w.trim().slice(1) : w)
  const [branchA, branchB] = steps[forkIndex][0].split(/\s+vs\.?\s+/i).map(cap)
  const after = steps.slice(forkIndex + 1)

  const W = 420
  const rowH = 58
  const boxW = 130
  const boxH = 40
  const cx = W / 2

  const beforeY = before.map((_, i) => 10 + i * rowH)
  const forkY = (beforeY.at(-1) ?? 0) + rowH + boxH / 2
  const afterY = after.map((_, i) => forkY + rowH + i * rowH)
  const H = (afterY.at(-1) ?? forkY) + boxH + 12

  const Box = ({ x, y, label, index, w = boxW }) => {
    const on = active === index
    return (
      <g {...pickProps(index, active, pick, label)}>
        <rect x={x - w / 2} y={y} width={w} height={boxH} fill={fillFor(on)} stroke="var(--ink)" strokeWidth="1" style={{ transition: 'fill 300ms' }} />
        <text x={x} y={y + boxH / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={inkFor(on)} style={{ pointerEvents: 'none' }}>
          {label}
        </text>
      </g>
    )
  }

  const link = (x1, y1, x2, y2, key) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="1.5" className="flow-dash" />
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-md" aria-hidden="true">
      {beforeY.slice(1).map((y, i) => link(cx, beforeY[i] + boxH, cx, y, `b-${i}`))}
      {link(cx, (beforeY.at(-1) ?? 0) + boxH, cx, forkY - boxH / 2 - 8, 'to-fork')}
      {link(cx, forkY - boxH / 2 - 8, cx - 100, forkY - boxH / 2 - 8, 'fork-a')}
      {link(cx, forkY - boxH / 2 - 8, cx + 100, forkY - boxH / 2 - 8, 'fork-b')}
      {link(cx - 100, forkY - boxH / 2 - 8, cx - 100, forkY - boxH / 2, 'fork-a2')}
      {link(cx + 100, forkY - boxH / 2 - 8, cx + 100, forkY - boxH / 2, 'fork-b2')}
      {after.length > 0 && link(cx - 100, forkY + boxH / 2, cx, afterY[0], 'join-a')}
      {after.length > 0 && link(cx + 100, forkY + boxH / 2, cx, afterY[0], 'join-b')}
      {afterY.slice(1).map((y, i) => link(cx, afterY[i] + boxH, cx, y, `a-${i}`))}

      {before.map(([l], i) => (
        <Box key={l} x={cx} y={beforeY[i]} label={l} index={i} />
      ))}
      <Box x={cx - 100} y={forkY - boxH / 2} label={branchA} index={forkIndex} w={110} />
      <Box x={cx + 100} y={forkY - boxH / 2} label={branchB} index={forkIndex} w={110} />
      {after.map(([l], i) => (
        <Box key={l} x={cx} y={afterY[i]} label={l} index={forkIndex + 1 + i} />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------- Kano curve
 * Three curves; the current one thickens and a dot rides along it.
 */
function KanoCurve({ cats, active, pick }) {
  const reduce = useReducedMotion()
  const W = 320
  const H = 240
  const pad = 30
  const paths = [
    `M ${pad} ${H - pad - 40} C ${W * 0.4} ${H - pad}, ${W * 0.65} ${H - pad - 10}, ${W - pad} ${pad + 40}`,
    `M ${pad} ${H - pad} L ${W - pad} ${pad}`,
    `M ${pad} ${H - pad} C ${W * 0.55} ${H - pad}, ${W * 0.7} ${pad + 60}, ${W - pad} ${pad - 6}`,
  ]
  const dash = [null, null, '6 5']

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-sm" aria-hidden="true">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" strokeWidth="1.5" />
        <line x1={pad} y1={H - pad} x2={pad} y2={pad - 10} stroke="var(--border)" strokeWidth="1.5" />
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
          Investment →
        </text>
        <text x="12" y={H / 2} textAnchor="middle" fontSize="10" fill="var(--text-muted)" transform={`rotate(-90 12 ${H / 2})`}>
          Satisfaction →
        </text>
        {cats.map(([label], i) => {
          const on = active === i
          return (
            <path
              key={label}
              d={paths[i]}
              fill="none"
              stroke={on ? 'var(--block-blue)' : 'var(--ink)'}
              strokeWidth={on ? 4 : 1.75}
              strokeOpacity={on ? 1 : 0.4}
              strokeDasharray={dash[i] || undefined}
              style={{ transition: 'stroke-width 300ms, stroke-opacity 300ms' }}
            />
          )
        })}
        {!reduce && active < 3 && (
          <circle key={active} r="6" fill="var(--block-blue)" stroke="var(--card)" strokeWidth="2">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={paths[active]} />
          </circle>
        )}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-2">
        {cats.map(([label], i) => (
          <li key={label}>
            <button type="button" aria-pressed={active === i} onClick={() => pick(i)} className="pill">
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------- MoSCoW buckets
 * Four buckets, every word visible — nothing to tap to read.
 */
function MoscowBuckets({ buckets }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {buckets.map(([label, detail, example], i) => (
        <li key={label} className="flex flex-col border border-ink bg-card p-3">
          <span className="font-display text-[2.5rem] leading-none" style={{ opacity: 1 - i * 0.18 }}>
            {label}
          </span>
          <span className="mt-2 text-text">{detail}</span>
          <span className="mt-auto pt-3 text-text-muted">e.g. {example}</span>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------- RICE calculator
 * Reach × Impact × Confidence ÷ Effort, live. Sliders and chips instead of
 * tap-to-reveal boxes; two presets from the worked example.
 */
const IMPACTS = [
  [0.25, 'minimal'],
  [0.5, 'low'],
  [1, 'medium'],
  [2, 'high'],
  [3, 'massive'],
]
const PRESETS = [
  { name: 'One-tap reorder', reach: 60000, impact: 2, confidence: 80, effort: 1 },
  { name: 'Dark mode', reach: 20000, impact: 0.5, confidence: 90, effort: 2 },
]
const fmt = (n) => Math.round(n).toLocaleString('en-IN')

// outside RiceCalculator on purpose: defined inside, it would remount on
// every change and drop the slider mid-drag
function Var({ label, value, def, on, children }) {
  return (
    <div className={`border bg-card p-3 transition-colors ${on ? 'border-ink' : 'border-border'}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-text">{label}</span>
        <span className="font-display text-section tabular-nums">{value}</span>
      </div>
      <p className="mt-1 text-text-muted">{def}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function RiceCalculator({ framework }) {
  const [v, setV] = useState(PRESETS[0])
  const [touched, setTouched] = useState('reach')
  const defs = Object.fromEntries(framework.variables.map(([k, d]) => [k.toLowerCase(), d]))
  const score = (v.reach * v.impact * (v.confidence / 100)) / v.effort
  const set = (key, value) => {
    setTouched(key)
    setV((prev) => ({ ...prev, name: null, [key]: value }))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.name} type="button" aria-pressed={v.name === p.name} onClick={() => setV(p)} className="pill">
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Var def={defs.reach} on={touched === 'reach'} label="Reach" value={fmt(v.reach)}>
          <input type="range" min="1000" max="100000" step="1000" value={v.reach} onChange={(e) => set('reach', Number(e.target.value))} aria-label="Reach, users per quarter" className="h-11 w-full accent-ink" />
        </Var>
        <Var def={defs.impact} on={touched === 'impact'} label="Impact" value={v.impact}>
          <div className="flex flex-wrap gap-1.5">
            {IMPACTS.map(([n, word]) => (
              <button key={n} type="button" aria-pressed={v.impact === n} onClick={() => set('impact', n)} className="pill">
                {word}
              </button>
            ))}
          </div>
        </Var>
        <Var def={defs.confidence} on={touched === 'confidence'} label="Confidence" value={`${v.confidence}%`}>
          <input type="range" min="10" max="100" step="10" value={v.confidence} onChange={(e) => set('confidence', Number(e.target.value))} aria-label="Confidence, percent" className="h-11 w-full accent-ink" />
        </Var>
        <Var def={defs.effort} on={touched === 'effort'} label="Effort" value={`${v.effort} mo`}>
          <input type="range" min="0.5" max="6" step="0.5" value={v.effort} onChange={(e) => set('effort', Number(e.target.value))} aria-label="Effort, person-months" className="h-11 w-full accent-ink" />
        </Var>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border border-ink bg-block-blue px-4 py-3 text-on-blue">
        <span className="text-body">
          {fmt(v.reach)} × {v.impact} × {v.confidence}% ÷ {v.effort}
        </span>
        <motion.span key={Math.round(score)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-[2.5rem] leading-none tabular-nums">
          {fmt(score)}
        </motion.span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- dispatcher */

/** @param {{ method: object }} props */
export default function MethodDiagram({ method }) {
  const { slug, steps, name } = method
  const label = `${name}: ${steps.map((s) => s[0]).join(', ')}`

  const shape = (drawn, Shape) => (
    <Motion parts={steps} drawn={drawn} label={label}>
      {(active, pick) => <Shape steps={steps.slice(0, drawn)} active={active} pick={pick} />}
    </Motion>
  )

  switch (slug) {
    case 'star-car':
      return shape(4, Chain)
    case 'sbi':
      return shape(4, Chain)
    case 'user-pain-solution':
      return shape(4, Chain)
    case 'circles':
      return shape(steps.length, Wheel)
    case 'north-star':
      return shape(steps.length, HubSatellites)
    case 'aarrr':
      return shape(5, Funnel)
    case 'heart':
      return shape(5, Rows)
    case 'metric-drop':
      return shape(steps.length, DecisionTree)
    case 'tam-sam-som':
      return shape(3, NestedCircles)
    case 'three-cs':
      return shape(4, Venn)
    case 'rice-moscow-kano': {
      const rice = method.frameworks.find((f) => f.key === 'rice')
      const moscow = method.frameworks.find((f) => f.key === 'moscow')
      const kano = method.frameworks.find((f) => f.key === 'kano')
      return (
        <div className="space-y-10">
          <section>
            <p className="label mb-2">RICE — score a long backlog</p>
            <RiceCalculator framework={rice} />
          </section>
          <section>
            <p className="label mb-2">MoSCoW — cut scope for a deadline</p>
            <MoscowBuckets buckets={moscow.buckets} />
          </section>
          <section>
            <p className="label mb-2">Kano — separate basics from delighters</p>
            <Motion parts={kano.categories} label={`Kano: ${kano.categories.map((c) => c[0]).join(', ')}`}>
              {(active, pick) => <KanoCurve cats={kano.categories} active={active} pick={pick} />}
            </Motion>
          </section>
        </div>
      )
    }
    default:
      return shape(Math.min(steps.length, 5), Chain)
  }
}
