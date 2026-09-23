import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, companiesNote } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row, Detail } from '../components/ui'
import CompanyMark, { CompanyLogo } from '../components/CompanyMark'
import Rich from '../components/Rich'
import { standoutsFor } from '../lib/companyMeta'
import { SECTORS } from '../data/guides-schema'

function matches(c, q) {
  return [c.name, c.slug, c.region, c.program, c.sector].some((f) => f.toLowerCase().includes(q))
}

export default function Companies() {
  useHead({
    title: 'Companies',
    description:
      'What the PM interview loop looks like at Google, Microsoft, Amazon, Meta, and the Indian APM programs — Flipkart, Zomato, Swiggy, Razorpay, Zepto, Meesho.',
    path: '/companies',
  })

  const [input, setInput] = useState('')
  const [sector, setSector] = useState('All')
  const query = input.trim().toLowerCase()

  const bySector = sector === 'All' ? companies : companies.filter((c) => c.sector === sector)
  const results = query ? bySector.filter((c) => matches(c, query)) : bySector

  const counts = useMemo(() => {
    const c = { All: companies.length }
    for (const s of SECTORS) c[s] = companies.filter((co) => co.sector === s).length
    return c
  }, [])

  return (
    <Page>
      <PageHead
        chapter="Module"
        title="Companies"
        intro="What each loop looks like — how many rounds, what format, what they weight. Sector, programme and a careers link for everyone else."
      />

      <p className="card p-4 text-text-muted">{companiesNote}</p>

      <div className="mt-4">
        <label htmlFor="company-q" className="label">
          Find a company
        </label>
        <input
          id="company-q"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Google, Swiggy, a startup…"
          autoComplete="off"
          className="mt-1 w-full rounded-button border border-border bg-surface px-3 py-2 placeholder:text-text-muted focus-visible:border-accent"
        />
      </div>

      <p className="label mt-4">Sector</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by sector">
        {['All', ...SECTORS].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={sector === s}
            onClick={() => setSector(s)}
            className={`pill min-h-9 ${sector === s ? '!border-accent !bg-accent !text-white' : ''}`}
          >
            {s} <span className={sector === s ? 'opacity-80' : 'text-text-muted'}>({counts[s]})</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="label mt-6">
        {results.length} {results.length === 1 ? 'company' : 'companies'}
      </p>

      {results.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {results.map((c) => {
            const hasLoop = c.rounds.length > 0
            const standout = standoutsFor(c)
            const sub = hasLoop
              ? [
                  c.region,
                  `${c.program} · ${c.rounds.length} rounds`,
                  standout.length ? `★ heavy on ${standout.join(', ').toLowerCase()}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : [c.sector, c.region, c.program].filter(Boolean).join(' · ')

            if (!hasLoop) {
              // no sourced loop to expand into — a plain row: profile + careers link
              return (
                <li key={c.slug} className="rounded-card border border-border bg-surface">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <CompanyLogo name={c.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-text">{c.name}</span>
                      <span className="block text-text-muted">{sub}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-border p-4">
                    <Link
                      to={`/companies/${c.slug}`}
                      className="btn btn-primary no-underline hover:no-underline"
                    >
                      Profile →
                    </Link>
                    <a
                      href={c.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn no-underline hover:no-underline"
                    >
                      Careers page ↗
                    </a>
                  </div>
                </li>
              )
            }

            return (
              <li key={c.slug}>
                <Row
                  tile={<CompanyLogo name={c.name} />}
                  icon="briefcase"
                  title={c.name}
                  sub={sub}
                >
                  <Detail
                    columns={[
                      { label: 'How it feels', children: <Rich>{c.format}</Rich> },
                      { label: 'Prep this specifically', children: <Rich>{c.whatToKnow}</Rich> },
                    ]}
                  />
                  <div className="flex flex-wrap gap-2 border-t border-border p-4">
                    <Link
                      to={`/companies/${c.slug}`}
                      className="btn btn-primary no-underline hover:no-underline"
                    >
                      The loop →
                    </Link>
                    <CompanyMark name={c.name} />
                  </div>
                </Row>
              </li>
            )
          })}
        </ul>
      ) : (
        /* not on the list: send them to the questions instead of a dead end */
        <div className="card mt-2 p-4">
          <p className="font-semibold text-text">No loop page for &ldquo;{input.trim()}&rdquo; yet.</p>
          <p className="prose-body mt-1">
            Most PM interviews test the same things whatever the company: product design,
            analytics, strategy, behavioral. Practice those and you are most of the way there.
          </p>
          <p className="mt-3 flex flex-wrap gap-3">
            <Link to="/browse" className="btn btn-primary no-underline hover:no-underline">
              Questions
            </Link>
            <Link to="/skills/assess" className="btn no-underline hover:no-underline">
              Weak spots
            </Link>
          </p>
        </div>
      )}
    </Page>
  )
}
