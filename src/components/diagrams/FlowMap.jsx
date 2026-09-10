import { useState } from 'react'
import Rich from '../Rich'

/**
 * An interactive flowchart. A root sits above a row of step nodes joined by an
 * SVG connector. Hovering or focusing a node previews it; clicking pins it. The
 * detail for the active node shows in a panel below.
 *
 * Real buttons, keyboard navigable, works on touch (tap = pin). The connector
 * is decorative and aria-hidden.
 *
 * @param {{
 *   root: string,
 *   sub?: string,
 *   steps: { step: string, short: string, detail: string }[],
 * }} props
 */
export default function FlowMap({ root, sub, steps }) {
  const [pinned, setPinned] = useState(0)
  const [hovered, setHovered] = useState(null)
  const active = hovered ?? pinned
  const current = steps[active]

  return (
    <div className="mt-4">
      {/* root */}
      <div className="mx-auto max-w-sm border border-rule-hard bg-paper-2 px-3 py-2 text-center">
        <div className="text-sm font-semibold text-ink">{root}</div>
        {sub && <div className="mt-0.5 text-xs text-ink-dim">{sub}</div>}
      </div>

      {/* connector */}
      <svg
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
        className="mx-auto block h-3.5 w-full max-w-md text-rule"
        aria-hidden="true"
      >
        <path
          d={`M50 0 V6 M${100 / (steps.length * 2)} 13 H${
            100 - 100 / (steps.length * 2)
          } M50 6 V13`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
        {steps.map((_, i) => {
          const x = (100 / steps.length) * (i + 0.5)
          return (
            <path
              key={i}
              d={`M${x} 13 V14`}
              stroke="currentColor"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {/* step nodes */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((s, i) => {
          const on = i === active
          return (
            <button
              key={s.step}
              type="button"
              aria-pressed={i === pinned}
              onClick={() => setPinned(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={`flex flex-col border px-1.5 py-1.5 text-left transition-colors ${
                on
                  ? 'border-accent bg-accent-quiet'
                  : 'border-rule hover:border-rule-hard'
              }`}
            >
              <span
                className={`text-xs font-semibold ${on ? 'text-accent' : 'text-ink'}`}
              >
                {s.step}
              </span>
              <span className="mt-0.5 text-[0.7rem] leading-tight text-ink-dim">
                {s.short}
              </span>
            </button>
          )
        })}
      </div>

      {/* detail */}
      <div className="mt-3 border-l-2 border-accent pl-3">
        <p className="label !text-accent">{current.step}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-dim">
          <Rich>{current.detail}</Rich>
        </p>
      </div>
    </div>
  )
}
