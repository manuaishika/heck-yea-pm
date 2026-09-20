/**
 * A plain three-circle Venn. Static — no hover, no clicking. Each circle is
 * labelled on its outer edge; where all three overlap is marked "PM", because
 * that intersection is the whole point.
 *
 * @param {{ corners: { label: string }[] }} props
 */
export default function Venn({ corners }) {
  const [a, b, c] = corners
  return (
    <svg
      viewBox="0 0 300 250"
      className="mx-auto mt-4 block w-full max-w-[20rem]"
      role="img"
      aria-label={`A product manager works where ${a.label}, ${b.label}, and ${c.label} all overlap.`}
    >
      <g
        fill="var(--accent)"
        fillOpacity="0.12"
        stroke="var(--accent)"
        strokeWidth="1.25"
      >
        <circle cx="150" cy="98" r="70" />
        <circle cx="112" cy="162" r="70" />
        <circle cx="188" cy="162" r="70" />
      </g>

      <g
        fill="var(--text)"
        fontFamily="var(--font-sans)"
        fontSize="12.5"
        fontWeight="600"
        textAnchor="middle"
      >
        <text x="150" y="22">{a.label}</text>
        <text x="40" y="242">{b.label}</text>
        <text x="260" y="242">{c.label}</text>
      </g>

      <circle cx="150" cy="141" r="15" fill="var(--accent)" />
      <text
        x="150"
        y="145"
        textAnchor="middle"
        fill="var(--surface)"
        fontFamily="var(--font-sans)"
        fontSize="10"
        fontWeight="700"
      >
        PM
      </text>
    </svg>
  )
}
