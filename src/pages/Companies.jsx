import { useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, companiesNote } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { CompanyLogo, CompanyLogoLink } from '../components/CompanyMark'
import { FEATURED_SLUGS, standoutsFor } from '../lib/companyMeta'

const featured = FEATURED_SLUGS.map((slug) =>
  companies.find((c) => c.slug === slug)
).filter(Boolean)

function matches(c, q) {
  return [c.name, c.slug, c.region, c.program].some((f) =>
    f.toLowerCase().includes(q)
  )
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
        chapter="Chapter 4"
        title="Companies"
        intro="What each loop looks like — how many rounds, what format, what they weight."
      />

      <p className="prose-body mt-4 border-l-4 border-accent pl-3">
        {companiesNote}
      </p>

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
          className="mt-1 w-full rounded-[6px] border-2 border-ink bg-paper-2 px-3 py-1.5 text-sm placeholder:text-ink-faint focus-visible:border-accent"
        />
      </div>

      {/* featured tiles — only when not searching; everyone is still in the list below */}
      {!query && (
        <>
          <p className="label mt-5">Featured</p>
          <ul className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/companies/${c.slug}`}
                  className="card flex h-full items-center gap-2 px-2.5 py-2 text-sm font-semibold text-ink no-underline hover:bg-paper"
                >
                  <CompanyLogo name={c.name} size="h-7 w-7" />
                  <span className="min-w-0">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p aria-live="polite" className="label mt-5">
        {query ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}` : 'Companies'}
      </p>

      {results.length > 0 ? (
        <ul className="mt-1 border-t-2 border-rule-hard">
          {results.map((c) => {
            const standout = standoutsFor(c)
            return (
              <li
                key={c.slug}
                className="flex items-start gap-3 border-b border-rule py-3"
              >
                <CompanyLogoLink name={c.name} className="mt-0.5" />
                <Link
                  to={`/companies/${c.slug}`}
                  className="block min-w-0 flex-1 no-underline"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-md text-ink">{c.name}</span>
                    <span className="label shrink-0">{c.region}</span>
                  </div>
                  <span className="prose-body mt-0.5 block">
                    {c.program} · {c.rounds.length} rounds
                  </span>
                  {standout.length > 0 && (
                    <span className="label mt-0.5 block !text-ink">
                      ★ heavy on {standout.join(', ').toLowerCase()}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        /* not on the list: send them to the generic PM prep instead of a dead end */
        <div className="card mt-2 p-3">
          <p className="text-md font-semibold text-ink">
            No loop page for &ldquo;{input.trim()}&rdquo; yet.
          </p>
          <p className="prose-body mt-1">
            Most PM interviews test the same things whatever the company:
            product design, analytics, strategy, behavioral. Practice those and
            you are most of the way there.
          </p>
          <p className="mt-3 flex flex-wrap gap-3">
            <Link to="/browse" className="btn btn-primary no-underline">
              Questions
            </Link>
            <Link to="/skills/assess" className="btn no-underline">
              Weak spots
            </Link>
          </p>
        </div>
      )}
    </Page>
  )
}
