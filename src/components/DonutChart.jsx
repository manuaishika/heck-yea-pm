import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const W = 560
const H = 380
const CX = 280
const CY = 190
const OUTER = 95
const INNER = 60
const GAP_DEG = 3 // visual gap between slices
const CARD_W = 184
const CARD_H = 66
const SIDE_PAD = 16
const V_PAD = 36

// Charts use only these four, darkest to lightest — nothing else.
const CHART_COLORS = ['var(--primary)', 'var(--chart-2)', 'var(--blue-300)', 'var(--blue-100)']

const toXY = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function sectorPath(startDeg, endDeg) {
  const s = startDeg + GAP_DEG / 2
  const e = endDeg - GAP_DEG / 2
  const [x1, y1] = toXY(OUTER, s)
  const [x2, y2] = toXY(OUTER, e)
  const [x3, y3] = toXY(INNER, e)
  const [x4, y4] = toXY(INNER, s)
  const large = e - s > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${OUTER} ${OUTER} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER} ${INNER} 0 ${large} 0 ${x4} ${y4} Z`
}

/** Layout: mid-angle decides which side a slice's card sits on (by the sign
 * of its x offset from centre), and slices on the same side stack top to
 * bottom in the order their anchor points fall down the circle. Colour is
 * assigned by rank — the biggest slice gets the darkest of the 4 chart
 * blues, not a fixed identity — so it stays correct if counts change. */
function layout(slices) {
  const total = slices.reduce((n, s) => n + s.count, 0)
  const byCount = [...slices].sort((a, b) => b.count - a.count)
  const colorOf = Object.fromEntries(byCount.map((s, i) => [s.key, CHART_COLORS[i % CHART_COLORS.length]]))

  let cursor = 0
  const withAngles = slices.map((s) => {
    const sweep = (s.count / total) * 360
    const start = cursor
    const end = cursor + sweep
    cursor = end
    const mid = (start + end) / 2
    const [ax, ay] = toXY(OUTER, mid)
    const [lx, ly] = toXY(OUTER + 6, mid) // leader line's ring-side anchor
    return { ...s, start, end, mid, color: colorOf[s.key], side: ax < CX ? 'left' : 'right', anchorY: ay, lx, ly }
  })
  for (const side of ['left', 'right']) {
    const group = withAngles.filter((s) => s.side === side).sort((a, b) => a.anchorY - b.anchorY)
    const slot = (H - V_PAD * 2 - CARD_H) / Math.max(group.length - 1, 1)
    group.forEach((s, i) => {
      s.cardX = side === 'left' ? SIDE_PAD : W - SIDE_PAD - CARD_W
      s.cardY = group.length === 1 ? (H - CARD_H) / 2 : V_PAD + i * slot
      s.cardAnchorX = side === 'left' ? s.cardX + CARD_W : s.cardX
      s.cardAnchorY = s.cardY + CARD_H / 2
    })
  }
  return { slices: withAngles, total }
}

/**
 * "What makes a PM" donut. Slice size is `count` from the caller — read
 * from the data files, never a fixed percentage. Desktop: ring with two
 * faint guide circles behind it, a callout card per slice joined by a
 * leader line. Mobile: ring on top, cards stacked below, no lines.
 */
export default function DonutChart({ slices }) {
  const navigate = useNavigate()
  const [active, setActive] = useState(null)
  const pointer = useRef('mouse')
  const { slices: laid, total } = layout(slices)

  const enter = (key) => pointer.current !== 'touch' && setActive(key)
  const leave = () => pointer.current !== 'touch' && setActive(null)

  return (
    <div>
      {/* desktop / tablet: ring + leader-line callouts */}
      <div className="relative hidden sm:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`What makes a PM: ${laid.map((s) => `${s.label} ${s.count}`).join(', ')}`}
        >
          <circle cx={CX} cy={CY} r={OUTER + 34} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
          <circle cx={CX} cy={CY} r={OUTER + 18} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />

          {laid.map((s) => (
            <line
              key={`line-${s.key}`}
              x1={s.cardAnchorX}
              y1={s.cardAnchorY}
              x2={s.lx}
              y2={s.ly}
              stroke="var(--border)"
              strokeWidth="1"
              style={{ opacity: active && active !== s.key ? 0.25 : 1 }}
            />
          ))}
          {laid.map((s) => (
            <circle
              key={`dot-${s.key}`}
              cx={s.cardAnchorX}
              cy={s.cardAnchorY}
              r="3"
              style={{ fill: s.color, opacity: active && active !== s.key ? 0.25 : 1 }}
            />
          ))}

          {laid.map((s) => (
            <a
              key={s.key}
              href={s.to}
              aria-label={`${s.label}: ${s.count} ${s.unit}`}
              onPointerDown={(e) => { pointer.current = e.pointerType }}
              onMouseEnter={() => enter(s.key)}
              onMouseLeave={leave}
              onFocus={() => enter(s.key)}
              onBlur={leave}
              onClick={(e) => {
                e.preventDefault()
                if (pointer.current === 'touch' && active !== s.key) {
                  setActive(s.key)
                  return
                }
                navigate(s.to)
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <path
                d={sectorPath(s.start, s.end)}
                style={{ fill: s.color, opacity: active && active !== s.key ? 0.3 : 1, transition: 'opacity 120ms' }}
              />
              <circle
                cx={s.lx}
                cy={s.ly}
                r="3"
                style={{ fill: s.color, opacity: active && active !== s.key ? 0.3 : 1 }}
              />
            </a>
          ))}

          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text-muted)">
            {total}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            areas
          </text>
        </svg>

        {laid.map((s) => (
          <Link
            key={s.key}
            to={s.to}
            onMouseEnter={() => enter(s.key)}
            onMouseLeave={leave}
            onFocus={() => enter(s.key)}
            onBlur={leave}
            className="absolute flex flex-col justify-center rounded-card border bg-surface px-3 py-2 no-underline hover:no-underline"
            style={{
              left: `${(s.cardX / W) * 100}%`,
              top: `${(s.cardY / H) * 100}%`,
              width: `${(CARD_W / W) * 100}%`,
              height: `${(CARD_H / H) * 100}%`,
              borderColor: active === s.key ? s.color : 'var(--border)',
            }}
          >
            <span className="text-body font-semibold" style={{ color: s.color }}>{s.label}</span>
            <span className="text-text-muted">{s.note}</span>
          </Link>
        ))}
      </div>

      {/* phones: ring only, cards stacked below, no leader lines */}
      <div className="sm:hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[220px]" role="img" aria-hidden="true">
          <circle cx={CX} cy={CY} r={OUTER + 34} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
          <circle cx={CX} cy={CY} r={OUTER + 18} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
          {laid.map((s) => (
            <path key={s.key} d={sectorPath(s.start, s.end)} style={{ fill: s.color }} />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text-muted)">
            {total}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            areas
          </text>
        </svg>
        <ul className="mt-3 space-y-2">
          {laid.map((s) => (
            <li key={s.key}>
              <Link
                to={s.to}
                className="flex items-center gap-3 rounded-card border border-border bg-surface px-3 py-2 no-underline hover:no-underline"
              >
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-pill" style={{ background: s.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-text">{s.label}</span>
                  <span className="block text-text-muted">{s.note}</span>
                </span>
                <span className="label shrink-0">{s.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
