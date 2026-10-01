/**
 * A left-to-right request chain: Client → API → Server → Database. Static, no
 * interaction. Four equal columns that fill the card, each a box with a
 * one-line label under it; the arrow sits in the gap, level with the boxes.
 * Two by two on narrow screens (arrows only where a pair shares a row).
 *
 * @param {{ steps: string[], labels: string[] }} props
 */
export default function Chain({ steps, labels }) {
  return (
    <ol className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 text-body sm:grid-cols-4">
      {steps.map((step, i) => {
        const last = i === steps.length - 1
        return (
          <li key={step}>
            <div className="relative">
              <div className="card px-2 py-2 text-center font-semibold text-text">{step}</div>
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 left-full ml-2 w-4 -translate-y-1/2 text-center text-text-muted ${
                    i % 2 === 1 ? 'hidden sm:block' : ''
                  }`}
                >
                  →
                </span>
              )}
            </div>
            <p className="mt-2 text-center leading-tight text-text-muted">{labels[i]}</p>
          </li>
        )
      })}
    </ol>
  )
}
