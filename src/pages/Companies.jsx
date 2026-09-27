import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { companies, companiesNote } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { brandFor, logoSrc } from '../lib/companyMeta'
import { SECTORS } from '../data/guides-schema'

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
        intro="Tap a company for its loop, programme and careers link. Loop marks the ones with sourced rounds."
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
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {results.map((c) => {
            const src = logoSrc(brandFor(c.name))
            return (
              <li key={c.slug}>
                <Link
                  to={`/companies/${c.slug}`}
                  aria-label={`${c.name}${c.rounds.length ? `, ${c.rounds.length}-round loop` : ''}`}
                  style={{ containerType: 'inline-size' }}
                  className="group relative flex aspect-square flex-col items-center justify-center gap-2 border border-border bg-card p-2 text-center text-text no-underline transition-colors hover:border-ink hover:no-underline"
                >
                  {src ? (
                    <img src={src} alt="" width="56" height="56" loading="lazy" className="size-12 object-contain sm:size-14" />
                  ) : (
                    <span className="font-sans font-semibold leading-[1.05] tracking-tight" style={{ fontSize: wordmarkSize(c.name) }}>
                      {c.name}
                    </span>
                  )}
                  {src && <span className="text-label font-semibold">{c.name}</span>}
                  {c.rounds.length > 0 && (
                    <span className="label absolute top-1.5 right-1.5 !text-text">Loop</span>
                  )}
                </Link>
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
