import { useRef, useState } from 'react'

/**
 * An interview loop as a horizontal stepper. Numbered pills across the top show
 * every round; below, one round's detail at a time. Swipe the panel or tap a
 * pill / arrow to move. No accordion clicking.
 *
 * @param {{ rounds: { name: string, detail: string }[] }} props
 */
export default function LoopFlow({ rounds }) {
  const [i, setI] = useState(0)
  const touch = useRef(null)
  const go = (n) => setI(Math.min(Math.max(n, 0), rounds.length - 1))
  const r = rounds[i]

  return (
    <div className="mt-3">
      {/* pills */}
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {rounds.map((round, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <button
              type="button"
              aria-current={idx === i ? 'step' : undefined}
              aria-label={`Round ${idx + 1}: ${round.name}`}
              onClick={() => go(idx)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border-2 text-xs font-bold ${
                idx === i
                  ? 'border-ink bg-accent text-on-accent'
                  : idx < i
                    ? 'border-ink bg-paper-2 text-ink'
                    : 'border-rule text-ink-faint'
              }`}
            >
              {idx + 1}
            </button>
            {idx < rounds.length - 1 && (
              <span
                className={`h-0.5 w-4 ${idx < i ? 'bg-ink' : 'bg-rule'}`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      {/* panel */}
      <div
        className="card mt-3 min-h-[5.5rem] p-3"
        onTouchStart={(e) => {
          touch.current = e.changedTouches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (dx < -40) go(i + 1)
          else if (dx > 40) go(i - 1)
          touch.current = null
        }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-ink">{r.name}</p>
          <p className="label shrink-0">
            {i + 1} / {rounds.length}
          </p>
        </div>
        {r.detail && (
          <p className="mt-1 text-sm leading-relaxed text-ink-dim">{r.detail}</p>
        )}
      </div>

      {/* arrows */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="chip disabled:opacity-30"
        >
          ‹ prev
        </button>
        <span className="label">swipe to move</span>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === rounds.length - 1}
          className="chip disabled:opacity-30"
        >
          next ›
        </button>
      </div>
    </div>
  )
}
