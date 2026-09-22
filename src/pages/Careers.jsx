import { Link } from 'react-router-dom'
import { careers, india } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import ModeMatrix from '../components/diagrams/ModeMatrix'
import ModeRadar from '../components/diagrams/ModeRadar'
import Rich from '../components/Rich'

const JUMP = [
  ['modes', 'Startup vs scaled vs large'],
  ['adjacent', 'Roles next to it'],
  ['ladder', 'The ladder'],
  ['india', 'Getting in from India'],
]

export default function Careers() {
  useHead({
    title: 'Careers & India',
    description:
      'How the PM job changes between an early startup, a scaled startup, and a large company, how it compares to adjacent roles, the ladder, and the new-grad programs that hire in India.',
    path: '/careers',
  })

  const { intro: indiaIntro, programs, noProgram, misconceptions } = india

  return (
    <Page wide>
      <PageHead chapter="Module" title="Careers & India" intro={<Rich>{careers.note}</Rich>} />

      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {JUMP.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className="btn btn-sm no-underline hover:no-underline">
            {i + 1} · {label}
          </a>
        ))}
      </nav>

      {/* modes */}
      <h2 id="modes" className="mt-8 scroll-mt-4 text-section">
        1 · Startup vs scaled vs large company
      </h2>
      <p className="mt-1 text-body text-text-muted">{careers.modes.note}</p>
      <ModeRadar modes={careers.modes} />
      <p className="label mt-5">The detail</p>
      <ModeMatrix modes={careers.modes} />

      {/* adjacent roles */}
      <h2 id="adjacent" className="mt-10 scroll-mt-4 text-section">
        2 · PM vs the roles next to it
      </h2>
      <ul className="mt-3 divide-y divide-border border-y border-border md:hidden">
        {careers.adjacent.map((r) => (
          <li key={r.role} className="py-3">
            <p className="font-semibold text-text">{r.role}</p>
            <p className="mt-1 text-text-muted">
              <Rich>{r.oneLine}</Rich>
            </p>
            <p className="label mt-2">vs PM</p>
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
              <th className="py-2 font-semibold">vs PM</th>
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
        3 · The ladder
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

      {/* india */}
      <h2 id="india" className="mt-10 scroll-mt-4 text-section">
        4 · Getting in from India
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
          </div>
        ))}
      </div>

      <p className="label mt-8">If you don't get a program</p>
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
