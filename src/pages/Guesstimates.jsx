import { Link } from 'react-router-dom'
import { guesstimates } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import Steps from '../components/diagrams/Steps'
import Tree from '../components/diagrams/Tree'

export default function Guesstimates() {
  useHead({
    title: 'Guesstimates',
    description:
      'Guesstimate questions across population, non-tech products, and tech products, plus how to size something and how to explain a metric drop.',
    path: '/guesstimates',
  })

  const { intro, sizing, diagnosis, questionSets, anchors } = guesstimates

  return (
    <Page wide>
      <PageHead chapter="Prepare" title="Guesstimates" intro={intro} />

      {/* practice questions first — the thing you came for */}
      <h2 className="mt-8 text-lg">Practice questions</h2>
      {questionSets.map((set) => (
        <div key={set.kind} className="mt-4">
          <div className="flex items-baseline gap-2 border-b border-rule pb-1">
            <h3 className="text-sm font-semibold text-ink">{set.kind}</h3>
            <span className="label">{set.questions.length}</span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">{set.note}</p>
          <ul className="mt-1.5">
            {set.questions.map((q) => (
              <li
                key={q}
                className="flex gap-2 border-b border-rule py-1.5 text-sm text-ink-dim"
              >
                <span className="mt-[9px] h-1 w-1 shrink-0 bg-ink" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* method: sizing */}
      <h2 className="mt-10 text-lg">{sizing.title}</h2>
      <Steps items={sizing.steps} />

      <p className="label mt-4">Worked example</p>
      <p className="mt-1 text-sm font-semibold text-ink">{sizing.example.q}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-sm">
          <tbody>
            {sizing.example.work.map(([label, value]) => (
              <tr key={label} className="border-b border-rule align-top">
                <th
                  scope="row"
                  className="w-40 py-2 pr-3 text-left font-normal text-ink"
                >
                  {label}
                </th>
                <td className="py-2 text-ink-dim">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* method: diagnosis */}
      <h2 className="mt-10 text-lg">{diagnosis.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-dim">{diagnosis.note}</p>
      <Steps items={diagnosis.steps} />

      <p className="label mt-4">MECE the causes</p>
      <p className="mt-1 text-xs text-ink-faint">{diagnosis.mece.note}</p>
      <div className="mt-2 grid gap-0.5 overflow-hidden rounded-[6px] border-2 border-ink bg-ink sm:grid-cols-2">
        {diagnosis.mece.buckets.map((b) => (
          <div key={b.label} className="bg-paper p-3">
            <p className="text-sm font-semibold text-ink">{b.label}</p>
            <p className="mt-1 text-sm text-ink-dim">{b.examples}</p>
          </div>
        ))}
      </div>

      <p className="label mt-5">The ways a metric moves</p>
      <Tree root={diagnosis.tree.root} branches={diagnosis.tree.branches} />

      <p className="mt-4 text-sm text-ink-dim">
        Practice on real ones —{' '}
        <Link to="/browse?category=analytics&hard=1">
          the RCA questions in the bank
        </Link>
        , each tied to a real company and a worked answer.
      </p>

      {/* anchors */}
      <h2 className="mt-10 text-lg">{anchors.title}</h2>
      <p className="mt-1 text-sm text-ink-dim">{anchors.note}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <tbody>
            {anchors.rows.map(([label, value]) => (
              <tr key={label} className="border-b border-rule">
                <th
                  scope="row"
                  className="py-2 pr-3 text-left font-normal text-ink"
                >
                  {label}
                </th>
                <td className="py-2 text-right text-ink-dim tabular-nums">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-ink-dim">
        These also live in the{' '}
        <Link to="/browse?category=strategy">Strategy question bank</Link>.
      </p>
    </Page>
  )
}
