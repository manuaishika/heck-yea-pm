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

      <h2 className="mt-8 text-section">New-grad programs</h2>
      <div className="mt-3 border-t border-border">
        {programs.map((p) => (
          <div key={p.name} className="border-b border-border py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-body font-semibold text-text">{p.name}</h3>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer noopener"
                className="label inline-flex min-h-11 shrink-0 items-center !text-text md:min-h-0"
              >
                careers page →
              </a>
            </div>
            <p className="mt-1 text-body text-text">{p.who}</p>
            <p className="mt-1 text-body text-text-muted">{p.note}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-section">If you don't get a program</h2>
      <p className="mt-1 text-body text-text-muted">{noProgram.note}</p>
      <div className="mt-3 border-t border-border">
        {noProgram.options.map((o) => (
          <div
            key={o.role}
            className="grid gap-1 border-b border-border py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
          >
            <div className="text-body font-semibold text-text">{o.role}</div>
            <div className="text-body text-text-muted">{o.why}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-section">Myths to ignore</h2>
      <dl className="mt-3 border-t border-border">
        {misconceptions.map(([claim, reality]) => (
          <div key={claim} className="border-b border-border py-3">
            <dt className="text-body text-text-muted line-through">{claim}</dt>
            <dd className="mt-1 border-l border-accent pl-3 text-body text-text-muted">
              {reality}
            </dd>
          </div>
        ))}
      </dl>
    </Page>
  )
}
