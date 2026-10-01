import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, companiesNote, companyHasData, companyHref, questionsForCompany } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { brandFor, logoSrc } from '../lib/companyMeta'
import { SECTORS } from '../data/guides-schema'

/** Logos as they are, no frames: the mark, the name under it. A company
 * with no saved logo shows its name set large in its place. */
function LogoWall({ list }) {
  return (
    <ul className="mt-4 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
      {list.map((c) => {
        const src = logoSrc(brandFor(c.name))
        const n = questionsForCompany(c).length
        return (
          <li key={c.slug}>
            <Link
              to={companyHref(c)}
              style={{ containerType: 'inline-size' }}
              className="group flex flex-col items-center gap-2 text-center text-text no-underline hover:no-underline"
            >
              <span className="grid h-16 w-full place-items-center transition-transform group-hover:-translate-y-1">
                {src ? (
                  <img src={src} alt="" width="64" height="64" loading="lazy" className="max-h-14 w-auto max-w-[80%] object-contain" />
                ) : (
                  <span className="font-semibold leading-[1.05] tracking-tight" style={{ fontSize: wordmarkSize(c.name) }}>
                    {c.name}
                  </span>
                )}
              </span>
              {src && <span className="text-body font-semibold leading-tight">{c.name}</span>}
              {companyHasData(c) && (
                <span className="label -mt-1">{n > 0 ? `${n} question${n === 1 ? '' : 's'}` : 'Loop'}</span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** A name set as its own logo: sized off the tile's width (container units)
 * and the longest line it will wrap to, so "Booking.com" fits as well as "Zoho". */
function wordmarkSize(name) {
  const words = name.split(' ')
  const line = words.length > 1 ? Math.max(...words.map((w) => w.length), Math.ceil(name.length / 2)) : name.length
  return `min(1.75rem, calc(100cqi / ${(line * 0.62 + 0.8).toFixed(2)}))`
}

function matches(c, q) {
  return [c.name, c.slug, c.region, c.program, c.sector].some((f) => f.toLowerCase().includes(q))
}

export default function Companies() {
  useHead({
    title: 'Companies',
    description:
      'What the product interview loop looks like at Google, Microsoft, Amazon, Meta, and the Indian APM programs — Flipkart, Zomato, Swiggy, Razorpay, Zepto, Meesho.',
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
        intro="Tap a logo for that company's questions and interview loop."
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
      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&>*]:shrink-0" role="group" aria-label="Filter by sector">
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
        <>
          <LogoWall list={results.filter(companyHasData)} />
          {results.some((c) => !companyHasData(c)) && (
            <>
              <h2 className="mt-10">Also hiring product managers</h2>
              <p className="mt-1 text-text-muted">No sourced loop or tagged questions yet. Each one opens the full question bank.</p>
              <LogoWall list={results.filter((c) => !companyHasData(c))} />
            </>
          )}
        </>
      ) : (
        /* not on the list: send them to the questions instead of a dead end */
        <div className="card mt-2 p-4">
          <p className="font-semibold text-text">No loop page for &ldquo;{input.trim()}&rdquo; yet.</p>
          <p className="prose-body mt-1">
            Most product interviews test the same things whatever the company: product design,
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
