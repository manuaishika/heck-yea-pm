import Rich from '../Rich'

/**
 * A numbered vertical process. Each step is one short line. The number sits in
 * the margin like a real manual.
 *
 * @param {{ items: string[] }} props
 */
export default function Steps({ items }) {
  return (
    <ol className="mt-3 border-t border-border">
      {items.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-[1.5rem_1fr] gap-3 border-b border-border py-2 text-body"
        >
          <span className="label pt-1 !text-text tabular-nums">{i + 1}</span>
          <span className="text-text-muted">
            <Rich>{item}</Rich>
          </span>
        </li>
      ))}
    </ol>
  )
}
