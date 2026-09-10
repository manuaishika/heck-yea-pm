import Pips from './Pips'

/**
 * The startup-vs-scaled-vs-MNC comparison, drawn as a scannable matrix.
 * Scalar dimensions get pip bars; the build/coordinate split gets a track
 * with a marker; the rest are short text. Reads in seconds, not minutes.
 *
 * @param {{ modes: import('../../data/guides').role['modes'] }} props
 */
export default function ModeMatrix({ modes }) {
  const { columns, bars, spectrum, text } = modes

  return (
    <div className="mt-3 overflow-x-auto">
      <div className="min-w-[30rem]">
        {/* header */}
        <div className="grid grid-cols-[7rem_repeat(3,1fr)] gap-x-3 border-b border-rule-hard pb-2">
          <span />
          {columns.map((c) => (
            <div key={c.key}>
              <div className="text-sm font-semibold text-ink">{c.name}</div>
              <div className="label">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* pip rows */}
        {bars.map((b) => (
          <div
            key={b.dim}
            className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-rule py-2.5"
          >
            <span className="label pt-0.5 !text-ink">{b.dim}</span>
            {b.levels.map((lvl, i) => (
              <div key={i}>
                <Pips level={lvl} />
                <div className="mt-1 text-xs leading-snug text-ink-dim">
                  {b.labels[i]}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* spectrum row */}
        <div className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-rule py-2.5">
          <span className="label pt-0.5 !text-ink">
            {spectrum.dim}
            <span className="mt-0.5 block font-normal text-ink-faint">
              {spectrum.ends[0]} → {spectrum.ends[1]}
            </span>
          </span>
          {spectrum.positions.map((pos, i) => (
            <div key={i}>
              <span
                className="relative block h-1.5 rounded-[1px] bg-rule"
                aria-hidden="true"
              >
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                  style={{ left: `${pos}%` }}
                />
              </span>
              <div className="mt-1 text-xs leading-snug text-ink-dim">
                {spectrum.labels[i]}
              </div>
            </div>
          ))}
        </div>

        {/* text rows */}
        {text.map((t) => (
          <div
            key={t.dim}
            className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-rule py-2.5 last:border-0"
          >
            <span className="label pt-0.5 !text-ink">{t.dim}</span>
            {t.values.map((v, i) => (
              <div key={i} className="text-xs leading-snug text-ink-dim">
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
