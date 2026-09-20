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
        <div className="grid grid-cols-[7rem_repeat(3,1fr)] gap-x-3 border-b border-border pb-2">
          <span />
          {columns.map((c) => (
            <div key={c.key}>
              <div className="text-body font-semibold text-text">{c.name}</div>
              <div className="label">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* pip rows */}
        {bars.map((b) => (
          <div
            key={b.dim}
            className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-border py-3"
          >
            <span className="label pt-1 !text-text">{b.dim}</span>
            {b.levels.map((lvl, i) => (
              <div key={i}>
                <Pips level={lvl} />
                <div className="mt-1 text-body leading-snug text-text-muted">
                  {b.labels[i]}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* spectrum row */}
        <div className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-border py-3">
          <span className="label pt-1 !text-text">
            {spectrum.dim}
            <span className="mt-1 block font-normal text-text-muted">
              {spectrum.ends[0]} → {spectrum.ends[1]}
            </span>
          </span>
          {spectrum.positions.map((pos, i) => (
            <div key={i}>
              <span
                className="relative block h-2 rounded-button bg-border"
                aria-hidden="true"
              >
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-button bg-text border-2 border-surface"
                  style={{ left: `${pos}%` }}
                />
              </span>
              <div className="mt-1 text-body leading-snug text-text-muted">
                {spectrum.labels[i]}
              </div>
            </div>
          ))}
        </div>

        {/* text rows */}
        {text.map((t) => (
          <div
            key={t.dim}
            className="grid grid-cols-[7rem_repeat(3,1fr)] items-start gap-x-3 border-b border-border py-3 last:border-0"
          >
            <span className="label pt-1 !text-text">{t.dim}</span>
            {t.values.map((v, i) => (
              <div key={i} className="text-body leading-snug text-text-muted">
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
