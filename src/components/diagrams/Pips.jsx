/**
 * A 0–3 strength indicator drawn as three segments. Filled segments use the text colour; empty use the border colour. Purely decorative — always paired with a
 * text label, and marked aria-hidden.
 */
export default function Pips({ level, max = 3 }) {
  return (
    <span
      className="inline-flex gap-1 align-middle"
      aria-hidden="true"
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-4 rounded-button ${
            i < level ? 'bg-text' : 'bg-border'
          }`}
        />
      ))}
    </span>
  )
}
