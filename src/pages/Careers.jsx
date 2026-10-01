import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { careers, india, companies } from '../data/guides'
import { SECTORS } from '../data/guides-schema'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { CompanyLogo } from '../components/CompanyMark'
import ModeMatrix from '../components/diagrams/ModeMatrix'
import ModeRadar from '../components/diagrams/ModeRadar'
import Rich from '../components/Rich'

const JUMP = [
  ['roles', 'Product role types'],
  ['breakin', 'Breaking in without a product background'],
  ['modes', 'Startup vs scaled vs large'],
  ['adjacent', 'Roles next to it'],
  ['ladder', 'The ladder'],
  ['india', "Getting in from India, and who's hiring"],
]

export default function Careers() {
  useHead({
    title: 'Careers',
    description:
      'Product role types — APM, product intern, product analyst — how to break in without a product background, how the job changes by company stage, the ladder, getting in from India, and who is hiring right now.',
    path: '/careers',
  })

  const { intro: indiaIntro, programs, noProgram, misconceptions } = india

  const [sector, setSector] = useState('All')
  const [location, setLocation] = useState('All')
  const locations = useMemo(
    () => ['All', ...new Set(companies.map((c) => c.region))].sort((a, b) => (a === 'All' ? -1 : a.localeCompare(b))),
    []
  )
  const hiring = companies.filter(
    (c) => (sector === 'All' || c.sector === sector) && (location === 'All' || c.region === location)
  )

  return (
    <Page wide>
      <PageHead chapter="Module" title="Careers" intro={<Rich>{careers.note}</Rich>} />

      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {JUMP.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className="btn btn-sm no-underline hover:no-underline">
            {i + 1} · {label}
          </a>
        ))}
      </nav>

      {/* role types */}
      <h2 id="roles" className="mt-8 scroll-mt-4 text-section">
        1 · Product role types
      </h2>
      <p className="mt-1 text-body text-text-muted">Three doors into the same career.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {careers.roleTypes.map((r) => (
          <div key={r.name} className="card p-3">
            <p className="font-semibold leading-tight text-text">{r.name}</p>
            <p className="mt-1 text-text-muted">{r.what}</p>
          </div>
        ))}
      </div>

      {/* breaking in */}
      <h2 id="breakin" className="mt-10 scroll-mt-4 text-section">
        2 · Breaking in without a product background
      </h2>
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

      {/* modes */}
      <h2 id="modes" className="mt-10 scroll-mt-4 text-section">
        3 · Startup vs scaled vs large company
      </h2>
      <p className="mt-1 text-body text-text-muted">{careers.modes.note}</p>
      <ModeRadar modes={careers.modes} />
      {/* the exact figures, for screen readers; the radar carries the picture */}
      <div className="sr-only">
        <ModeMatrix modes={careers.modes} />
      </div>

      {/* adjacent roles */}
      <h2 id="adjacent" className="mt-10 scroll-mt-4 text-section">
        4 · Product manager vs the roles next to it
      </h2>
      <ul className="mt-3 divide-y divide-border border-y border-border md:hidden">
        {careers.adjacent.map((r) => (
          <li key={r.role} className="py-3">
            <p className="font-semibold text-text">{r.role}</p>
            <p className="mt-1 text-text-muted">
              <Rich>{r.oneLine}</Rich>
            </p>
            <p className="label mt-2">vs product manager</p>
            <p className="mt-1 text-text-muted">
              <Rich>{r.vsPm}</Rich>
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-3 hidden md:block">
        <table className="w-full border-collapse text-body">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="w-40 py-2 pr-3 font-semibold">Role</th>
              <th className="py-2 pr-3 font-semibold">What it is</th>
              <th className="py-2 font-semibold">vs product manager</th>
            </tr>
          </thead>
          <tbody>
            {careers.adjacent.map((r) => (
              <tr key={r.role} className="border-b border-border align-top">
                <th scope="row" className="py-3 pr-3 text-left font-semibold text-text">
                  {r.role}
                </th>
                <td className="py-3 pr-3 text-text-muted">
                  <Rich>{r.oneLine}</Rich>
                </td>
                <td className="py-3 text-text-muted">
                  <Rich>{r.vsPm}</Rich>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ladder */}
      <h2 id="ladder" className="mt-10 scroll-mt-4 text-section">
        5 · The ladder
      </h2>
      <div className="mt-3">
        <table className="w-full border-collapse text-body">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 font-semibold">Level</th>
              <th className="py-2 pr-3 font-semibold">Years</th>
              <th className="py-2 font-semibold">Focus</th>
            </tr>
          </thead>
          <tbody>
            {careers.growth.map((g) => (
              <tr key={g.level} className="border-b border-border align-top">
                <th scope="row" className="py-3 pr-3 text-left font-semibold text-text">
                  {g.level}
                </th>
                <td className="py-3 pr-3 text-text-muted tabular-nums">{g.years}</td>
                <td className="py-3 text-text-muted">{g.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* india + who's hiring: one section */}
      <h2 id="india" className="mt-10 scroll-mt-4 text-section">
        6 · Getting in from India, and who&rsquo;s hiring
      </h2>
      <p className="mt-1 text-body text-text-muted">{indiaIntro}</p>

      <p className="label mt-6">New-grad programs</p>
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
            <p className="label mt-1 !text-accent">{p.mode}</p>
          </div>
        ))}
      </div>

      <p className="label mt-8">Hiring now · tap a name for their careers page</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <div>
          <label htmlFor="hiring-sector" className="label block">
            Sector
          </label>
          <select
            id="hiring-sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 min-h-11 rounded-button border border-border bg-surface px-3 py-2 text-body"
          >
            <option>All</option>
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hiring-location" className="label block">
            Location
          </label>
          <select
            id="hiring-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 min-h-11 rounded-button border border-border bg-surface px-3 py-2 text-body"
          >
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <p aria-live="polite" className="label mt-4">
        {hiring.length} {hiring.length === 1 ? 'company' : 'companies'}
      </p>

      {hiring.length > 0 ? (
        <ul className="mt-2 grid gap-x-8 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {hiring.map((c) => (
            <li key={c.slug} className="border-b border-border">
              <a
                href={c.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${c.name} careers page, opens in a new tab`}
                className="flex min-h-11 items-center gap-3 py-2 text-text no-underline hover:no-underline"
              >
                <span className="grid size-6 shrink-0 place-items-center">
                  <CompanyLogo name={c.name} />
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
                <span aria-hidden="true" className="text-text-muted">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card mt-2 p-4 text-text-muted">No companies match that combination.</p>
      )}

      <p className="label mt-8">Myths to ignore</p>
      <dl className="mt-3 border-t border-border">
        {misconceptions.map(([claim, reality]) => (
          <div key={claim} className="border-b border-border py-3">
            <dt className="text-body text-text-muted line-through">{claim}</dt>
            <dd className="mt-1 border-l border-accent pl-3 text-body text-text-muted">{reality}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 border-t border-border pt-4 text-text-muted">
        <Link to="/resume">Resume</Link>
      </p>
    </Page>
  )
}
