import { resources } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

export default function Resources() {
  useHead({
    title: 'Resources',
    description:
      'Newsletters, launch trackers, design references, and practice sites to build product taste before a PM interview.',
    path: '/resources',
  })

  return (
    <Page>
      <PageHead chapter="Prepare" title="Resources" intro={resources.intro} />

      {resources.groups.map((g) => (
        <section key={g.name} className="mt-7">
          <h2 className="border-b border-border pb-1 text-body font-semibold text-text">
            {g.name}
          </h2>
          <ul className="mt-2">
            {g.items.map((it) => (
              <li key={it.name} className="border-b border-border py-2">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-body font-semibold"
                >
                  {it.name}
                </a>
                <p className="mt-1 text-body text-text-muted">{it.what}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  )
}
