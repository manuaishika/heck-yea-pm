/**
 * A left-to-right request chain: Client → API → Server → Database. Static, no
 * interaction. Each node has a one-line label under it. Wraps on narrow screens.
 *
 * @param {{ steps: string[], labels: string[] }} props
 */
export default function Chain({ steps, labels }) {
  return (
    <ol className="mt-3 flex flex-wrap items-stretch gap-y-3 text-sm">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start">
          <div className="w-28 shrink-0">
            <div className="panel px-2 py-1 text-center font-semibold text-ink">
              {step}
            </div>
            <div className="mt-1 text-center text-xs leading-tight text-ink-dim">
              {labels[i]}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span
              className="mx-1 self-center text-ink-faint"
              aria-hidden="true"
            >
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
