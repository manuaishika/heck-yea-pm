/**
 * The site mascot — a small figure standing on the flowchart's own
 * node-and-line motif, planting a flag at the node it just reached.
 * Original design, not based on any existing character. One colour
 * (the accent/primary), so it always matches the active theme.
 *
 * Used only on the landing hero, empty states, and the flashcard
 * completion screen — nowhere else.
 */
export default function Mascot({ size = 72, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      role="img"
      aria-label="Heck Yea PM mascot"
    >
      <line x1="46" y1="150" x2="100" y2="150" stroke="var(--border)" strokeWidth="4" />
      <line x1="100" y1="150" x2="154" y2="150" stroke="var(--border)" strokeWidth="4" />
      <circle cx="46" cy="150" r="7" fill="none" stroke="var(--accent)" strokeWidth="4" />
      <circle cx="154" cy="150" r="7" fill="none" stroke="var(--accent)" strokeWidth="4" />
      <line x1="100" y1="150" x2="100" y2="112" stroke="var(--accent)" strokeWidth="4" />
      <circle cx="100" cy="150" r="8" fill="var(--accent)" />
      <circle cx="100" cy="82" r="30" fill="var(--accent)" />
      <circle cx="90" cy="78" r="4.5" fill="var(--white)" />
      <circle cx="110" cy="78" r="4.5" fill="var(--white)" />
      <path d="M91 92q9 7 18 0" stroke="var(--white)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <line x1="128" y1="78" x2="142" y2="70" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
      <path d="M142 70l10-4v10z" fill="var(--accent)" />
    </svg>
  )
}
