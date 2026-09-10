/**
 * Renders a short string with `**key terms**` shown under a highlighter mark.
 * Not markdown — just this one rule, so the words that matter jump out of an
 * otherwise grey sentence.
 *
 * @param {{ children: string, className?: string }} props
 */
export default function Rich({ children, className }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*)/g)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/)
        return m ? (
          <mark key={i} className="hl">
            {m[1]}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </span>
  )
}
