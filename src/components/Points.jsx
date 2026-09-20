/**
 * A section of a question answer: a small label, then its points as a tight
 * bullet list. This is the whole answer format now — no prose paragraphs.
 *
 * @param {{ label: string, points: string[], compact?: boolean }} props
 */
export default function Points({ label, points, compact = false }) {
  return (
    <section className={compact ? 'mt-2' : 'mt-4'}>
      <p className="label">{label}</p>
      <ul className={`mt-1 space-y-${compact ? '0.5' : '1'}`}>
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-body leading-relaxed text-text-muted">
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 bg-text"
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
