import { useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, companiesNote } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row, Detail } from '../components/ui'
import CompanyMark, { CompanyLogo } from '../components/CompanyMark'
import Rich from '../components/Rich'
import { FEATURED_SLUGS, standoutsFor } from '../lib/companyMeta'

const featured = FEATURED_SLUGS.map((slug) => companies.find((c) => c.slug === slug)).filter(
  Boolean
)

function matches(c, q) {
  return [c.name, c.slug, c.region, c.program].some((f) => f.toLowerCase().includes(q))
}

export default function Companies() {
  useHead({
    title: 'Companies',
    description:
      'What the PM interview loop looks like at Google, Microsoft, Amazon, Meta, and the Indian APM programs — Flipkart, Zomato, Swiggy, Razorpay, Zepto, Meesho.',
    path: '/companies',
  })

  const [input, setInput] = useState('')
  const query = input.trim().toLowerCase()
  const results = query ? companies.filter((c) => matches(c, query)) : companies

  return (
    <Page>
      <PageHead
        chapter="Module"
        title="Companies"
        intro="What each loop looks like — how many rounds, what format, what they weight."
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

      {/* featured: pills only when not searching; everyone is still in the list below */}
      {!query && (
        <>
          <p className="label mt-4">Featured</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {featured.map((c) => (
              <li key={c.slug}>
                <Link to={`/companies/${c.slug}`} className="pill">
                  <CompanyLogo name={c.name} size="size-4" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p aria-live="polite" className="label mt-6">
        {query ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}` : 'Companies'}
      </p>

      {results.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {results.map((c) => {
            const standout = standoutsFor(c)
            const sub = [
              c.region,
              `${c.program} · ${c.rounds.length} rounds`,
              standout.length ? `★ heavy on ${standout.join(', ').toLowerCase()}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
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
