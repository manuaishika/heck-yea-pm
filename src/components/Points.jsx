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
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-dim">
            <span
              aria-hidden="true"
              className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-ink-faint"
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
