import { Link } from 'react-router-dom'
import { careers } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import ModeMatrix from '../components/diagrams/ModeMatrix'
import ModeRadar from '../components/diagrams/ModeRadar'
import Rich from '../components/Rich'

export default function Careers() {
  useHead({
    title: 'Careers & paths',
    description:
      'How the PM job changes between an early startup, a scaled startup, and a large company, how it compares to adjacent roles, and how the ladder works.',
    path: '/careers',
  })

  return (
    <Page wide>
      <PageHead
        chapter="Prepare"
        title="Careers & paths"
        intro={<Rich>{careers.note}</Rich>}
      />

      {/* modes */}
      <h2 className="mt-8 text-section">Startup vs scaled vs large company</h2>
      <p className="mt-1 text-body text-text-muted">{careers.modes.note}</p>
      <ModeRadar modes={careers.modes} />
      <p className="label mt-5">The detail</p>
      <ModeMatrix modes={careers.modes} />

      {/* adjacent roles */}
      <h2 className="mt-10 text-section">PM vs the roles next to it</h2>
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
                <th
                  scope="row"
                  className="py-3 pr-3 text-left font-semibold text-text"
                >
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
      <h2 className="mt-10 text-section">The ladder</h2>
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
                <th
                  scope="row"
                  className="py-3 pr-3 text-left font-semibold text-text"
                >
                  {g.level}
                </th>
                <td className="py-3 pr-3 text-text-muted tabular-nums">
                  {g.years}
                </td>
                <td className="py-3 text-text-muted">{g.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 flex flex-wrap gap-3 border-t border-border pt-4 text-text-muted">
        <Link to="/india">Getting in from India</Link>
        <span aria-hidden="true">·</span>
        <Link to="/resume">Resume</Link>
      </p>
    </Page>
  )
}
