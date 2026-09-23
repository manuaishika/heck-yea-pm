import { useEffect, useRef, useState } from 'react'

/**
 * Every answering method's main element: a clickable SVG diagram shaped for
 * that specific framework (a chain for STAR/CAR, a wheel for CIRCLES, a
 * funnel for AARRR, and so on — see the dispatcher at the bottom). Clicking
 * any part reveals that step's explanation plus the matching line from the
 * method's worked example. Fades and rises in once it's on screen (once),
 * and respects reduced motion both via the JS check below and the site's
 * global CSS override on .diagram-enter's transition.
 *
 * Blues only throughout — var(--accent) / var(--accent-tint) / var(--border)
 * / var(--text) / var(--text-muted) / var(--surface) — nothing else.
 */

function useInView(threshold = 0.3) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Wrap({ children, label }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={`diagram-enter ${inView ? 'in-view' : ''}`} aria-label={label}>
      {children}
    </div>
  )
}

function Detail({ label, detail, example }) {
  return (
    <div className="card mt-4 p-4">
      <p className="label">{label}</p>
      <p className="mt-1 text-text">{detail}</p>
      {example && (
        <>
          <p className="label mt-3">In the worked example</p>
          <p className="mt-1 text-text-muted">{example}</p>
        </>
      )}
    </div>
  )
}

/** Matches a step's label to its line in the worked example, falling back
 * to the same-index line when the example uses slightly different wording. */
function exampleFor(method, label, index) {
  const hit = method.example.work.find(([l]) => l === label)
  if (hit) return hit[1]
  return method.example.work[index]?.[1] ?? null
}

function pickProps(i, active, setActive) {
  const isActive = active === i
  return {
    isActive,
    onClick: () => setActive(isActive ? null : i),
    tabIndex: 0,
    role: 'button',
    'aria-pressed': isActive,
    style: { cursor: 'pointer' },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setActive(isActive ? null : i)
      }
    },
  }
}

const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/* ---------------------------------------------------------- step chain
 * STAR/CAR, SBI, and the generic user→pain→solution→metrics: linked boxes
 * in sequence, connected by arrows.
 */
function StepChain({ method, steps, trailingLabel, trailingText }) {
  const [active, setActive] = useState(null)
  const n = steps.length
  const boxW = 128
  const boxH = 60
  const gap = 30
  const totalW = n * boxW + (n - 1) * gap
  const H = boxH + 16

  return (
    <Wrap label={`${method.name}: ${steps.map((s) => s[0]).join(' then ')}`}>
      <svg viewBox={`0 0 ${totalW} ${H}`} className="mx-auto block w-full max-w-2xl" role="img" aria-hidden="true">
        <defs>
          <marker id={`arrow-${method.slug}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--border)" />
          </marker>
        </defs>
        {steps.map(([label], i) => {
          const x = i * (boxW + gap)
          const y = 8
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={label}>
              {i < n - 1 && (
                <line
                  x1={x + boxW}
                  y1={y + boxH / 2}
                  x2={x + boxW + gap}
                  y2={y + boxH / 2}
                  stroke="var(--border)"
                  strokeWidth="2"
                  markerEnd={`url(#arrow-${method.slug})`}
                />
              )}
              <rect
                x={x}
                y={y}
                width={boxW}
                height={boxH}
                rx="10"
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={x + boxW / 2}
                y={y + boxH / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
      {trailingText && (
        <p className="mt-2 text-center text-text-muted">
          <span className="font-semibold text-text">{trailingLabel}:</span> {trailingText}
        </p>
      )}
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* ------------------------------------------------------------- wheel
 * CIRCLES: seven equal segments round a ring, each labelled with the
 * framework's own letter (the acronym is spelled out by the step labels).
 */
function Wheel({ method, steps }) {
  const [active, setActive] = useState(null)
  const CX = 140
  const CY = 140
  const OUTER = 118
  const INNER = 58
  const GAP = 2.5
  const n = steps.length
  const sweep = 360 / n

  const sectorPath = (start, end) => {
    const s = start + GAP / 2
    const e = end - GAP / 2
    const [x1, y1] = polar(CX, CY, OUTER, s)
    const [x2, y2] = polar(CX, CY, OUTER, e)
    const [x3, y3] = polar(CX, CY, INNER, e)
    const [x4, y4] = polar(CX, CY, INNER, s)
    const large = e - s > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${OUTER} ${OUTER} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER} ${INNER} 0 ${large} 0 ${x4} ${y4} Z`
  }

  return (
    <Wrap label={`${method.name}: ${steps.map((s) => s[0]).join(', ')}`}>
      <svg viewBox="0 0 280 280" className="mx-auto block w-full max-w-sm" role="img" aria-hidden="true">
        {steps.map(([label], i) => {
          const start = i * sweep
          const end = start + sweep
          const mid = (start + end) / 2
          const [lx, ly] = polar(CX, CY, (OUTER + INNER) / 2, mid)
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={label}>
              <path
                d={sectorPath(start, end)}
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={lx}
                y={ly + 6}
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--accent)'}
                style={{ pointerEvents: 'none' }}
              >
                {label[0]}
              </text>
            </g>
          )
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-muted)">
          {method.name}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          tap a letter
        </text>
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* ----------------------------------------------------- hub + satellites
 * North Star: the North Star metric sits in the middle; goal, inputs,
 * guardrails and the conflict case orbit it, each connected by a line.
 */
function HubSatellites({ method, steps }) {
  const [active, setActive] = useState(null)
  const hubIndex = steps.findIndex(([l]) => l.toLowerCase().includes('north star'))
  const hub = hubIndex === -1 ? 0 : hubIndex
  const satellites = steps.map((s, i) => i).filter((i) => i !== hub)
  const CX = 180
  const CY = 160
  const R = 108
  const hubR = 46
  const satR = 40

  return (
    <Wrap label={`${method.name}: ${steps[hub][0]} at the centre, ${satellites.map((i) => steps[i][0]).join(', ')} around it`}>
      <svg viewBox="0 0 360 320" className="mx-auto block w-full max-w-md" role="img" aria-hidden="true">
        {satellites.map((i, k) => {
          const deg = (360 / satellites.length) * k
          const [x, y] = polar(CX, CY, R, deg)
          return <line key={`l-${i}`} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border)" strokeWidth="1.5" />
        })}
        {satellites.map((i, k) => {
          const deg = (360 / satellites.length) * k
          const [x, y] = polar(CX, CY, R, deg)
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={satR}
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {steps[i][0]}
              </text>
            </g>
          )
        })}
        {(() => {
          const { isActive, ...rest } = pickProps(hub, active, setActive)
          return (
            <g>
              <circle
                cx={CX}
                cy={CY}
                r={hubR}
                fill={isActive ? 'var(--accent)' : 'var(--accent)'}
                fillOpacity={isActive ? 1 : 0.85}
                stroke="var(--accent)"
                strokeWidth="2"
                {...rest}
              />
              <text
                x={CX}
                y={CY - 2}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--surface)"
                style={{ pointerEvents: 'none' }}
              >
                North
              </text>
              <text
                x={CX}
                y={CY + 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--surface)"
                style={{ pointerEvents: 'none' }}
              >
                Star
              </text>
            </g>
          )
        })()}
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* ------------------------------------------------------------- funnel
 * AARRR: five narrowing bands, top to bottom.
 */
function Funnel({ method, steps }) {
  const [active, setActive] = useState(null)
  const n = steps.length
  const W = 320
  const rowH = 46
  const gap = 6
  const H = n * rowH + (n - 1) * gap
  const topInset = 0
  const maxInset = W * 0.32

  return (
    <Wrap label={`${method.name} funnel: ${steps.map((s) => s[0]).join(' → ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-sm" role="img" aria-hidden="true">
        {steps.map(([label], i) => {
          const y = i * (rowH + gap)
          const inTop = topInset + ((maxInset - topInset) * i) / n
          const inBot = topInset + ((maxInset - topInset) * (i + 1)) / n
          const points = `${inTop},${y} ${W - inTop},${y} ${W - inBot},${y + rowH} ${inBot},${y + rowH}`
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={label}>
              <polygon
                points={points}
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={W / 2}
                y={y + rowH / 2 + 5}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* -------------------------------------------------------------- grid
 * HEART: five rows, dimension on the left, what it means on the right.
 */
function DimensionGrid({ method, steps }) {
  const [active, setActive] = useState(null)
  const n = steps.length
  const W = 480
  const rowH = 42
  const H = n * rowH
  const colSplit = 150

  return (
    <Wrap label={`${method.name}: ${steps.map((s) => s[0]).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-xl" role="img" aria-hidden="true">
        {steps.map(([label, detail], i) => {
          const y = i * rowH
          const { isActive, ...rest } = pickProps(i, active, setActive)
          const clip = detail.length > 46 ? `${detail.slice(0, 44)}…` : detail
          return (
            <g key={label}>
              <rect
                x="0"
                y={y}
                width={W}
                height={rowH - 4}
                rx="8"
                fill={isActive ? 'var(--accent)' : i % 2 === 0 ? 'var(--accent-tint)' : 'var(--surface)'}
                stroke="var(--border)"
                strokeWidth="1"
                {...rest}
              />
              <line x1={colSplit} y1={y} x2={colSplit} y2={y + rowH - 4} stroke="var(--border)" strokeWidth="1" opacity="0.6" />
              <text
                x="14"
                y={y + rowH / 2 + 1}
                fontSize="13"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
              <text
                x={colSplit + 14}
                y={y + rowH / 2 + 1}
                fontSize="11"
                fill={isActive ? 'var(--surface)' : 'var(--text-muted)'}
                style={{ pointerEvents: 'none' }}
              >
                {clip}
              </text>
            </g>
          )
        })}
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* --------------------------------------------------------- nested circles
 * TAM/SAM/SOM: three concentric circles, largest to smallest.
 */
function NestedCircles({ method, steps, note }) {
  const [active, setActive] = useState(null)
  const CX = 150
  const CY = 150
  const radii = [130, 90, 48]

  return (
    <Wrap label={`${method.name}: ${steps.map((s) => s[0]).join(' inside ')}`}>
      <svg viewBox="0 0 300 300" className="mx-auto block w-full max-w-sm" role="img" aria-hidden="true">
        {steps.map(([label], i) => {
          const r = radii[i]
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <circle
              key={label}
              cx={CX}
              cy={CY}
              r={r}
              fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
              fillOpacity={isActive ? 0.9 : 1}
              stroke="var(--accent)"
              strokeWidth={isActive ? 2 : 1}
              {...rest}
            />
          )
        })}
        {steps.map(([label], i) => {
          const r = radii[i]
          const y = CY - r + 20
          return (
            <text
              key={`t-${label}`}
              x={CX}
              y={y}
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              fill="var(--text)"
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          )
        })}
      </svg>
      {note && <p className="mt-2 text-center text-text-muted">{note}</p>}
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* -------------------------------------------------------------- venn
 * 3Cs: Customer, Company, Competitors, with Overlap named at the centre.
 */
function InteractiveVenn({ method, steps }) {
  const [active, setActive] = useState(null)
  const [customer, company, competitors, overlap] = steps
  const circles = [
    { cx: 150, cy: 98, i: 0 },
    { cx: 112, cy: 162, i: 1 },
    { cx: 188, cy: 162, i: 2 },
  ]
  const positions = [
    { x: 150, y: 22 },
    { x: 40, y: 240 },
    { x: 260, y: 240 },
  ]

  return (
    <Wrap label={`${method.name}: where ${customer[0]}, ${company[0]} and ${competitors[0]} overlap`}>
      <svg viewBox="0 0 300 260" className="mx-auto block w-full max-w-sm" role="img" aria-hidden="true">
        {circles.map(({ cx, cy, i }) => {
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="70"
              fill="var(--accent)"
              fillOpacity={isActive ? 0.32 : 0.12}
              stroke="var(--accent)"
              strokeWidth={isActive ? 2 : 1.25}
              {...rest}
            />
          )
        })}
        {positions.map((p, i) => (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)" style={{ pointerEvents: 'none' }}>
            {steps[i][0]}
          </text>
        ))}
        {overlap &&
          (() => {
            const { isActive, ...rest } = pickProps(3, active, setActive)
            return (
              <g>
                <circle cx="150" cy="141" r="17" fill="var(--accent)" {...rest} />
                <text x="150" y="145" textAnchor="middle" fill="var(--surface)" fontSize="9" fontWeight="700" style={{ pointerEvents: 'none' }}>
                  {overlap[0]}
                </text>
              </g>
            )
          })()}
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* --------------------------------------------------------------- tree
 * Metric-drop: a straight run that forks at "internal vs external", then
 * converges on a hypothesis.
 */
function DecisionTree({ method, steps }) {
  const [active, setActive] = useState(null)
  const forkIndex = steps.findIndex(([l]) => /vs/i.test(l))
  const before = steps.slice(0, forkIndex)
  const [forkLabel] = steps[forkIndex]
  const [branchA, branchB] = forkLabel.split(/\s+vs\.?\s+/i)
  const after = steps.slice(forkIndex + 1)

  const W = 420
  const rowH = 56
  const boxW = 120
  const boxH = 40

  const centerX = W / 2
  let y = 10
  const rows = []
  before.forEach(([label], i) => rows.push({ y: (y += i === 0 ? 0 : rowH), label, index: i, x: centerX }))
  const forkY = (rows.at(-1)?.y ?? 0) + rowH
  const afterStartY = forkY + rowH
  after.forEach(([label], i) => rows.push({ y: afterStartY + i * rowH, label, index: forkIndex + 1 + i, x: centerX }))
  const H = (rows.at(-1)?.y ?? forkY) + boxH + 16

  const Box = ({ x, y, label, index, small }) => {
    const { isActive, ...rest } = pickProps(index, active, setActive)
    const w = small ? 100 : boxW
    return (
      <g key={`${label}-${index}`}>
        <rect
          x={x - w / 2}
          y={y}
          width={w}
          height={boxH}
          rx="8"
          fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
          stroke="var(--accent)"
          strokeWidth={isActive ? 2 : 1}
          {...rest}
        />
        <text
          x={x}
          y={y + boxH / 2 + 4}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={isActive ? 'var(--surface)' : 'var(--text)'}
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      </g>
    )
  }

  return (
    <Wrap label={`${method.name}: ${steps.map((s) => s[0]).join(' → ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-md" role="img" aria-hidden="true">
        {before.map((s, i) => i < before.length - 1 && (
          <line key={`c-${i}`} x1={centerX} y1={rows[i].y + boxH} x2={centerX} y2={rows[i + 1].y} stroke="var(--border)" strokeWidth="2" />
        ))}
        {before.length > 0 && (
          <line x1={centerX} y1={rows[before.length - 1].y + boxH} x2={centerX} y2={forkY} stroke="var(--border)" strokeWidth="2" />
        )}
        <line x1={centerX} y1={forkY} x2={centerX - 90} y2={forkY} stroke="var(--border)" strokeWidth="2" />
        <line x1={centerX} y1={forkY} x2={centerX + 90} y2={forkY} stroke="var(--border)" strokeWidth="2" />
        <line x1={centerX - 90} y1={forkY} x2={centerX - 90} y2={forkY + 8} stroke="var(--border)" strokeWidth="2" />
        <line x1={centerX + 90} y1={forkY} x2={centerX + 90} y2={forkY + 8} stroke="var(--border)" strokeWidth="2" />
        {after.length > 0 && (
          <>
            <line x1={centerX - 90} y1={forkY + 8} x2={centerX} y2={afterStartY} stroke="var(--border)" strokeWidth="2" />
            <line x1={centerX + 90} y1={forkY + 8} x2={centerX} y2={afterStartY} stroke="var(--border)" strokeWidth="2" />
          </>
        )}

        {before.map((s, i) => (
          <Box key={i} x={centerX} y={rows[i].y} label={s[0]} index={i} />
        ))}
        <Box x={centerX - 90} y={forkY - boxH / 2} label={branchA?.trim()} index={forkIndex} small />
        <Box x={centerX + 90} y={forkY - boxH / 2} label={branchB?.trim()} index={forkIndex} small />
        {after.map((s, i) => (
          <Box key={`a-${i}`} x={centerX} y={afterStartY + i * rowH} label={s[0]} index={forkIndex + 1 + i} />
        ))}
      </svg>
      {active !== null && (
        <Detail label={steps[active][0]} detail={steps[active][1]} example={exampleFor(method, steps[active][0], active)} />
      )}
    </Wrap>
  )
}

/* ------------------------------------------------------- RICE formula */
function RiceFormula({ method, framework }) {
  const [active, setActive] = useState(null)
  const vars = framework.variables
  const ops = ['×', '×', '÷']
  const n = vars.length
  const boxW = 110
  const boxH = 60
  const opW = 30
  const totalW = n * boxW + (n - 1) * opW
  const H = boxH + 12

  return (
    <Wrap label={`RICE: ${framework.formula}`}>
      <svg viewBox={`0 0 ${totalW} ${H}`} className="mx-auto block w-full max-w-2xl" role="img" aria-hidden="true">
        {vars.map(([label], i) => {
          const x = i * (boxW + opW)
          const y = 4
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={label}>
              <rect
                x={x}
                y={y}
                width={boxW}
                height={boxH}
                rx="10"
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={x + boxW / 2}
                y={y + boxH / 2 + 5}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
              {i < n - 1 && (
                <text
                  x={x + boxW + opW / 2}
                  y={y + boxH / 2 + 6}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill="var(--text-muted)"
                >
                  {ops[i]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {active !== null && <Detail label={vars[active][0]} detail={vars[active][1]} />}
    </Wrap>
  )
}

/* ------------------------------------------------------- MoSCoW buckets */
function MoscowBuckets({ framework }) {
  const [active, setActive] = useState(null)
  const buckets = framework.buckets
  const n = buckets.length
  const gap = 10
  const boxW = 100
  const boxH = 90
  const totalW = n * boxW + (n - 1) * gap

  return (
    <Wrap label={`MoSCoW: ${buckets.map((b) => b[0]).join(', ')}`}>
      <svg viewBox={`0 0 ${totalW} ${boxH}`} className="mx-auto block w-full max-w-2xl" role="img" aria-hidden="true">
        {buckets.map(([label, , example], i) => {
          const x = i * (boxW + gap)
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <g key={label}>
              <rect
                x={x}
                y="0"
                width={boxW}
                height={boxH}
                rx="10"
                fill={isActive ? 'var(--accent)' : 'var(--accent-tint)'}
                stroke="var(--accent)"
                strokeWidth={isActive ? 2 : 1}
                {...rest}
              />
              <text
                x={x + boxW / 2}
                y="26"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={isActive ? 'var(--surface)' : 'var(--text)'}
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
              <text
                x={x + boxW / 2}
                y="56"
                textAnchor="middle"
                fontSize="9"
                fill={isActive ? 'var(--surface)' : 'var(--text-muted)'}
                style={{ pointerEvents: 'none' }}
              >
                e.g.
              </text>
              <foreignObject x={x + 6} y="60" width={boxW - 12} height="26">
                <p
                  style={{
                    fontSize: '9px',
                    textAlign: 'center',
                    color: isActive ? 'var(--surface)' : 'var(--text-muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {example}
                </p>
              </foreignObject>
            </g>
          )
        })}
      </svg>
      {active !== null && (
        <Detail label={buckets[active][0]} detail={buckets[active][1]} example={`e.g. ${buckets[active][2]}`} />
      )}
    </Wrap>
  )
}

/* ------------------------------------------------------- Kano curve */
function KanoCurve({ framework }) {
  const [active, setActive] = useState(null)
  const cats = framework.categories // Basic, Performance, Delighter
  const W = 320
  const H = 260
  const pad = 30

  const paths = [
    `M ${pad} ${H - pad - 40} C ${W * 0.4} ${H - pad}, ${W * 0.65} ${H - pad - 10}, ${W - pad} ${pad + 30}`, // basic-ish
    `M ${pad} ${H - pad} L ${W - pad} ${pad}`, // performance: straight diagonal
    `M ${pad} ${H - pad} C ${W * 0.55} ${H - pad}, ${W * 0.7} ${pad + 60}, ${W - pad} ${pad}`, // delighter
  ]
  const dash = [null, null, '5 4']
  // label markers, stacked so they never overlap: basic ends lowest
  // (satisfaction plateaus), delighter highest (disproportionate payoff)
  const endPoints = [
    [W - pad, pad + 58],
    [W - pad, pad + 20],
    [W - pad - 6, pad - 10],
  ]

  return (
    <Wrap label={`Kano: ${cats.map((c) => c[0]).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-sm" role="img" aria-hidden="true">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" strokeWidth="1.5" />
        <line x1={pad} y1={H - pad} x2={pad} y2={pad} stroke="var(--border)" strokeWidth="1.5" />
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          Investment →
        </text>
        <text x="10" y={H / 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)" transform={`rotate(-90 10 ${H / 2})`}>
          Satisfaction →
        </text>
        {cats.map(([label], i) => {
          const { isActive, ...rest } = pickProps(i, active, setActive)
          return (
            <path
              key={label}
              d={paths[i]}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={isActive ? 3.5 : 2}
              strokeOpacity={isActive || active === null ? 1 : 0.35}
              strokeDasharray={dash[i] || undefined}
              {...rest}
            />
          )
        })}
        {cats.map(([label], i) => {
          const { isActive, ...rest } = pickProps(i, active, setActive)
          const [ex, ey] = endPoints[i]
          return (
            <g key={`lbl-${label}`} {...rest}>
              <circle cx={ex} cy={ey} r="14" fill="var(--surface)" />
              <text
                x={ex}
                y={ey + 4}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill={isActive ? 'var(--accent)' : 'var(--text-muted)'}
              >
                {label[0]}
              </text>
            </g>
          )
        })}
      </svg>
      {active !== null && <Detail label={cats[active][0]} detail={cats[active][1]} example={`e.g. ${cats[active][2]}`} />}
    </Wrap>
  )
}

/* ---------------------------------------------------------- dispatcher */

/** @param {{ method: object }} props */
export default function MethodDiagram({ method }) {
  const { slug, steps } = method

  switch (slug) {
    case 'star-car':
      return <StepChain method={method} steps={steps.slice(0, 4)} trailingLabel={steps[4][0]} trailingText={steps[4][1]} />
    case 'sbi':
      return <StepChain method={method} steps={steps.slice(0, 3)} trailingLabel={steps[3][0]} trailingText={steps[3][1]} />
    case 'user-pain-solution':
      return <StepChain method={method} steps={steps} />
    case 'circles':
      return <Wheel method={method} steps={steps} />
    case 'north-star':
      return <HubSatellites method={method} steps={steps} />
    case 'aarrr':
      return <Funnel method={method} steps={steps.slice(0, 5)} />
    case 'heart':
      return <DimensionGrid method={method} steps={steps.slice(0, 5)} />
    case 'metric-drop':
      return <DecisionTree method={method} steps={steps} />
    case 'tam-sam-som':
      return (
        <NestedCircles
          method={method}
          steps={steps.slice(0, 3)}
          note={steps
            .slice(3)
            .map((s) => s[0])
            .join(' · ')}
        />
      )
    case 'three-cs':
      return <InteractiveVenn method={method} steps={steps.slice(0, 4)} />
    case 'rice-moscow-kano': {
      const rice = method.frameworks.find((f) => f.key === 'rice')
      const moscow = method.frameworks.find((f) => f.key === 'moscow')
      const kano = method.frameworks.find((f) => f.key === 'kano')
      return (
        <div className="space-y-8">
          <div>
            <p className="label mb-1">RICE — score a long backlog</p>
            <RiceFormula method={method} framework={rice} />
          </div>
          <div>
            <p className="label mb-1">MoSCoW — cut scope for a deadline</p>
            <MoscowBuckets framework={moscow} />
          </div>
          <div>
            <p className="label mb-1">Kano — separate basics from delighters</p>
            <KanoCurve framework={kano} />
          </div>
        </div>
      )
    }
    default:
      return <StepChain method={method} steps={steps} />
  }
}
