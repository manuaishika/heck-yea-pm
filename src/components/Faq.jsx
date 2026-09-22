import { useState } from 'react'

/** A plain accordion: one open item at a time, keyboard accessible. */
export default function Faq({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, i) => {
        const on = open === i
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex min-h-11 w-full items-center justify-between gap-3 py-3 text-left font-semibold text-text"
            >
              {item.q}
              <span aria-hidden="true" className="shrink-0 text-section text-text-muted">
                {on ? '−' : '+'}
              </span>
            </button>
            {on && <p className="pb-3 text-text-muted">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
