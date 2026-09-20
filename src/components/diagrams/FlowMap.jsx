import { useState } from 'react'
import Rich from '../Rich'

/**
 * An interactive flowchart. A root sits above a row of step nodes joined by an
 * SVG connector. Hovering or focusing a node previews it; clicking pins it. The
 * detail for the active node shows in a card below.
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
      <div className="card mx-auto max-w-sm px-3 py-2 text-center">
        <div className="text-body font-semibold text-text">{root}</div>
        {sub && <div className="mt-1 text-body text-text-muted">{sub}</div>}
      </div>

      {/* connector */}
      <svg
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
        className="mx-auto block h-4 w-full max-w-md text-border"
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
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {/* step nodes */}
      <div
        className="grid gap-2"
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
              className={`flex flex-col rounded-button border border-border px-2 py-2 text-left ${
                on ? 'bg-accent text-surface' : 'bg-surface hover:border-accent'
              }`}
            >
              <span
                className={`text-body font-semibold ${on ? 'text-surface' : 'text-text'}`}
              >
                {s.step}
              </span>
              <span
                className={`mt-1 text-body leading-tight ${on ? 'text-surface' : 'text-text-muted'}`}
              >
                {s.short}
              </span>
            </button>
          )
        })}
      </div>

      {/* detail */}
      <div className="mt-3 border-l border-accent pl-3">
        <p className="label !text-text">{current.step}</p>
        <p className="mt-1 text-body leading-relaxed text-text-muted">
          <Rich>{current.detail}</Rich>
        </p>
      </div>
    </div>
  )
}
