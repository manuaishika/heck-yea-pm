import { useState } from 'react'
import Rich from '../Rich'

/**
 * An interactive flowchart. A root sits above a row of step nodes joined by an
 * SVG connector. Hovering or focusing a node previews it; clicking pins it. The
 * detail for the active node shows in a card below.
 *
 * On a phone the nodes wrap three over two (the six-column grid below) and
 * show only their name; the one-line summary moves into the detail card so
 * nothing clips. The connector only draws where the nodes sit in one row.
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
      {/* root: tinted header band */}
      <div className="tint mx-auto max-w-sm rounded-card px-3 py-2 text-center">
        <div className="text-body font-semibold text-text">{root}</div>
        {sub && <div className="mt-1 text-body text-text-muted">{sub}</div>}
      </div>

      {/* connector */}
      <svg
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
        className="mx-auto hidden h-4 w-full max-w-md text-border sm:block"
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
        className="mt-3 grid grid-cols-6 gap-1.5 sm:mt-0 sm:gap-2 sm:[grid-template-columns:repeat(var(--steps),minmax(0,1fr))]"
        style={{ '--steps': steps.length }}
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
              className={`flex min-h-11 flex-col items-center justify-center rounded-button border border-border px-1 py-2 text-center sm:col-span-1 sm:items-stretch sm:justify-start sm:px-2 sm:text-left ${
                i < 3 ? 'col-span-2' : 'col-span-3'
              } ${
                on ? 'bg-accent text-surface' : 'bg-surface hover:border-accent'
              }`}
            >
              <span
                className={`text-body font-semibold ${on ? 'text-surface' : 'text-text'}`}
              >
                {s.step}
              </span>
              <span
                className={`mt-1 hidden text-body leading-tight sm:block ${on ? 'text-surface' : 'text-text-muted'}`}
              >
                {s.short}
              </span>
            </button>
          )
        })}
      </div>

      {/* detail: tinted strip */}
      <div className="tint mt-3 rounded-card border-l-4 border-accent px-3 py-2">
        <p className="label !text-text">
          {current.step}
          <span className="sm:hidden"> · {current.short}</span>
        </p>
        <p className="mt-1 text-body leading-relaxed text-text">
          <Rich>{current.detail}</Rich>
        </p>
      </div>
    </div>
  )
}
