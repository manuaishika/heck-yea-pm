import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { allItems } from '../lib/globalSearch'
import { normalize, queryTokens } from '../lib/search'

const GROUPS = ['Question', 'Method', 'Company', 'Topic']
const GROUP_LABEL = { Question: 'Questions', Method: 'Methods', Company: 'Companies', Topic: 'Topics' }

export default function Index() {
  useHead({
    title: 'Index',
    description: 'Every question, method and company on the site, in one list — search or filter to find one fast.',
    path: '/directory',
  })

  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const items = allItems()

  const filtered = useMemo(() => {
    const tokens = queryTokens(q)
    return items.filter((it) => {
      if (type !== 'All' && GROUP_LABEL[it.type] !== type) return false
      if (tokens.length === 0) return true
      const hay = normalize(`${it.label} ${it.sub}`)
      return tokens.every((t) => hay.includes(t))
    })
  }, [items, q, type])

  const grouped = GROUPS.map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    rows: filtered.filter((it) => it.type === g),
  })).filter((g) => g.rows.length > 0)

  const counts = { All: items.length }
  for (const g of GROUPS) counts[GROUP_LABEL[g]] = items.filter((it) => it.type === g).length

  return (
    <Page wide>
      <PageHead chapter="Index" title="Every entry" intro="Every question, method and company on the site, in one list." />

      <div className="border border-border">
        <label htmlFor="index-q" className="sr-only">
          Search the index
        </label>
        <input
          id="index-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions, methods, companies…"
          autoComplete="off"
          className="w-full bg-card px-4 py-3 text-body placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {['All', ...GROUPS.map((g) => GROUP_LABEL[g])].map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={`pill ${type === t ? 'pill-on' : ''}`}
          >
            {t} <span className="opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="label mt-6">
        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
      </p>

      {grouped.length > 0 ? (
        <div className="mt-2">
          {grouped.map((g) => (
            <section key={g.key} className="border-t border-border py-4 first:border-t-0">
              <h2 className="text-section">{g.label}</h2>
              <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
                {g.rows.map((it) => (
                  <li key={g.key + it.to} className="border-b border-border">
                    <Link
                      to={it.to}
                      className="flex min-h-11 items-center justify-between gap-3 py-2 text-text no-underline hover:no-underline hover:text-accent"
                    >
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      <span className="label shrink-0">{it.sub}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-4 border border-border p-4 text-text-muted">No entries match &ldquo;{q}&rdquo;.</p>
      )}
    </Page>
  )
}
