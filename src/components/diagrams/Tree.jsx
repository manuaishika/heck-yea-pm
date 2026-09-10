/**
 * A one-level decision / breakdown tree: a root splits into branches, each
 * branch lists its leaves. Used for "metric down 5% → three ways that happens".
 * Plain nested lists with connector rules — legible at any width, no SVG.
 *
 * @param {{ root: string, branches: {label: string, leaves: string[]}[] }} props
 */
export default function Tree({ root, branches }) {
  return (
    <div className="mt-3">
      <div className="inline-block border border-rule-hard px-2.5 py-1 text-sm font-semibold text-ink">
        {root}
      </div>
      <ul className="mt-2 space-y-3 border-l border-rule pl-4">
        {branches.map((b) => (
          <li key={b.label}>
            <div className="text-sm font-semibold text-accent">{b.label}</div>
            <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
              {b.leaves.map((leaf) => (
                <li
                  key={leaf}
                  className="border border-rule px-2 py-0.5 text-xs text-ink-dim"
                >
                  {leaf}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
