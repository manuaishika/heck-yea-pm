/**
 * A 0–3 strength indicator drawn as three segments. Filled segments use the
 * accent; empty use the rule colour. Purely decorative — always paired with a
 * text label, and marked aria-hidden.
 */
export default function Pips({ level, max = 3 }) {
  return (
    <span
      className="inline-flex gap-[3px] align-middle"
      aria-hidden="true"
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-[1px] ${
            i < level ? 'bg-accent' : 'bg-rule'
          }`}
        />
      ))}
    </span>
  )
}
