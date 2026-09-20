import { india } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

export default function India() {
  useHead({
    title: 'Getting in from India',
    description:
      'The new-grad PM programs that hire in India, what to do if you do not get one, and the qualification myths to ignore.',
    path: '/india',
  })

  const { intro, programs, noProgram, misconceptions } = india

  return (
    <Page wide>
      <PageHead chapter="Prepare" title="Getting in from India" intro={intro} />

      <h2 className="mt-8 text-lg">New-grad programs</h2>
      <div className="mt-3 border-t border-rule">
        {programs.map((p) => (
          <div key={p.name} className="border-b border-rule py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{p.name}</h3>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                className="label shrink-0 !text-ink"
              >
                careers page →
              </a>
            </div>
            <p className="mt-0.5 text-sm text-ink">{p.who}</p>
            <p className="mt-0.5 text-sm text-ink-dim">{p.note}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg">If you don't get a program</h2>
      <p className="mt-1 text-sm text-ink-dim">{noProgram.note}</p>
      <div className="mt-3 border-t border-rule">
        {noProgram.options.map((o) => (
          <div
            key={o.role}
            className="grid gap-1 border-b border-rule py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4"
          >
            <div className="text-sm font-semibold text-ink">{o.role}</div>
            <div className="text-sm text-ink-dim">{o.why}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg">Myths to ignore</h2>
      <dl className="mt-3 border-t border-rule">
        {misconceptions.map(([claim, reality]) => (
          <div key={claim} className="border-b border-rule py-2.5">
            <dt className="text-sm text-ink-faint line-through">{claim}</dt>
            <dd className="mt-1 border-l-4 border-accent pl-3 text-sm text-ink-dim">
              {reality}
            </dd>
          </div>
        ))}
      </dl>
    </Page>
  )
}
