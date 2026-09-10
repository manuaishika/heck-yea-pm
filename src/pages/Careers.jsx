import { Link } from 'react-router-dom'
import { careers } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import ModeMatrix from '../components/diagrams/ModeMatrix'
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
      <h2 className="mt-8 text-lg">Startup vs scaled vs large company</h2>
      <p className="mt-1 text-sm text-ink-dim">{careers.modes.note}</p>
      <ModeMatrix modes={careers.modes} />

      {/* adjacent roles */}
      <h2 className="mt-10 text-lg">PM vs the roles next to it</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule-hard text-left">
              <th className="w-40 py-2 pr-3 font-semibold">Role</th>
              <th className="py-2 pr-3 font-semibold">What it is</th>
              <th className="py-2 font-semibold">vs PM</th>
            </tr>
          </thead>
          <tbody>
            {careers.adjacent.map((r) => (
              <tr key={r.role} className="border-b border-rule align-top">
                <th
                  scope="row"
                  className="py-2.5 pr-3 text-left font-semibold text-ink"
                >
                  {r.role}
                </th>
                <td className="py-2.5 pr-3 text-ink-dim">
                  <Rich>{r.oneLine}</Rich>
                </td>
                <td className="py-2.5 text-ink-dim">
                  <Rich>{r.vsPm}</Rich>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ladder */}
      <h2 className="mt-10 text-lg">The ladder</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule-hard text-left">
              <th className="py-2 pr-3 font-semibold">Level</th>
              <th className="w-16 py-2 pr-3 font-semibold">Years</th>
              <th className="py-2 font-semibold">Focus</th>
            </tr>
          </thead>
          <tbody>
            {careers.growth.map((g) => (
              <tr key={g.level} className="border-b border-rule align-top">
                <th
                  scope="row"
                  className="py-2.5 pr-3 text-left font-semibold text-ink"
                >
                  {g.level}
                </th>
                <td className="py-2.5 pr-3 text-ink-faint tabular-nums">
                  {g.years}
                </td>
                <td className="py-2.5 text-ink-dim">{g.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-ink-dim">
        Interviewing in India? <Link to="/india">What's different</Link>.
      </p>
    </Page>
  )
}
