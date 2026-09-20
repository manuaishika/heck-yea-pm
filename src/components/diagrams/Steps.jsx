import Rich from '../Rich'

/**
 * A numbered vertical process. Each step is one short line. The number sits in
 * the margin like a real manual.
 *
 * @param {{ items: string[] }} props
 */
export default function Steps({ items }) {
  return (
    <ol className="mt-3 border-t border-rule">
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-[1.5rem_1fr] gap-3 border-b border-rule py-2 text-sm"
        >
          <span className="label pt-0.5 !text-ink tabular-nums">{i + 1}</span>
          <span className="text-ink-dim">
            <Rich>{item}</Rich>
          </span>
        </li>
      ))}
    </ol>
  )
}
