import Pips from './Pips'

/**
 * The startup-vs-scaled-vs-MNC comparison, drawn as a scannable matrix.
 * Scalar dimensions get pip bars; the build/coordinate split gets a track
 * with a marker; the rest are short text. Reads in seconds, not minutes.
 *
 * Three columns side by side from md up; on a phone each dimension becomes
 * its own block with one line per company type, so nothing scrolls sideways.
 *
 * @param {{ modes: import('../../data/guides').role['modes'] }} props
 */
export default function ModeMatrix({ modes }) {
  const { columns, bars, spectrum, text } = modes

  const rows = [
    ...bars.map((b) => ({
      dim: b.dim,
      cell: (i) => (
        <>
          <Pips level={b.levels[i]} />
          <div className="mt-1 leading-snug text-text-muted">{b.labels[i]}</div>
        </>
      ),
    })),
    {
      dim: spectrum.dim,
      hint: `${spectrum.ends[0]} → ${spectrum.ends[1]}`,
      cell: (i) => (
        <>
          <span className="relative block h-2 rounded-button bg-border" aria-hidden="true">
            <span
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-button border-2 border-surface bg-text"
              style={{ left: `${spectrum.positions[i]}%` }}
            />
          </span>
          <div className="mt-1 leading-snug text-text-muted">{spectrum.labels[i]}</div>
        </>
      ),
    },
    ...text.map((t) => ({
      dim: t.dim,
      cell: (i) => <div className="leading-snug text-text-muted">{t.values[i]}</div>,
    })),
  ]

  return (
    <div className="mt-3">
      {/* phones: one block per dimension */}
      <div className="md:hidden">
        {rows.map((r) => (
          <div key={r.dim} className="border-b border-border py-3 last:border-0">
            <p className="label !text-text">
              {r.dim}
              {r.hint && <span className="ml-2 text-body font-normal normal-case tracking-normal text-text-muted">{r.hint}</span>}
            </p>
            <ul className="mt-2 space-y-3">
              {columns.map((c, i) => (
                <li key={c.key} className="flex gap-3">
                  <span className="w-24 shrink-0 font-semibold text-text">{c.name}</span>
                  <span className="min-w-0 flex-1">{r.cell(i)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* md and up: the three-column grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[7rem_repeat(3,1fr)] gap-x-3 border-b border-border pb-2">
          <span />
          {columns.map((c) => (
            <div key={c.key}>
              <div className="font-semibold text-text">{c.name}</div>
              <div className="label">{c.sub}</div>
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <div
            key={r.dim}
            className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-border py-3 last:border-0"
          >
            <span className="label pt-1 !text-text">
              {r.dim}
              {r.hint && <span className="mt-1 block font-normal text-text-muted">{r.hint}</span>}
            </span>
            {columns.map((c, i) => (
              <div key={c.key}>{r.cell(i)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
