import { Link } from 'react-router-dom'
import { guesstimates } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row, Detail, Block } from '../components/ui'
import Steps from '../components/diagrams/Steps'
import Tree from '../components/diagrams/Tree'

function WorkTable({ rows }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-border align-top last:border-0">
            <th scope="row" className="w-2/5 py-2 pr-3 text-left font-normal text-text">
              {label}
            </th>
            <td className="py-2 text-text-muted">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Question({ q }) {
  return (
    <li>
      <Row icon="question" title={q.q} sub={q.how}>
        <Block label="Working" rule={false}>
          <WorkTable rows={q.steps} />
        </Block>
        <Detail
          columns={[
            { label: 'Answer', children: <p className="font-semibold">{q.answer}</p> },
            { label: 'Sanity check', children: <p className="text-text-muted">{q.check}</p> },
          ]}
        />
      </Row>
    </li>
  )
}

function Section({ id, title, count, note, children }) {
  return (
    <section id={id} className="mt-10 scroll-mt-4">
      <div className="flex items-baseline gap-2 border-b border-border pb-2">
        <h2>{title}</h2>
        {count && <span className="label">{count}</span>}
      </div>
      {note && <p className="mt-2 text-text-muted">{note}</p>}
      {children}
    </section>
  )
}

function Sub({ title, count, note, children }) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-2">
        <h3 className="font-semibold text-text">{title}</h3>
        {count && <span className="label">{count}</span>}
      </div>
      {note && <p className="mt-1 text-text-muted">{note}</p>}
      {children}
    </div>
  )
}

const JUMP = [
  ['practice', 'Practice'],
  ['sizing', 'How to size'],
  ['drops', 'Metric drops'],
  ['numbers', 'Numbers'],
]

export default function Guesstimates() {
  useHead({
    title: 'Guesstimates',
    description:
      'Guesstimate questions with worked answers across population, non-tech products, and tech products, plus how to size something and how to explain a metric drop.',
    path: '/guesstimates',
  })

  const { intro, sizing, diagnosis, questionSets, anchors } = guesstimates
  const total = questionSets.reduce((n, s) => n + s.questions.length, 0)

  return (
    <Page wide>
      <PageHead chapter="Prepare" title="Guesstimates" intro={intro} />

      <nav aria-label="On this page" className="flex flex-wrap gap-2">
        {JUMP.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className="btn btn-sm no-underline hover:no-underline">
            {i + 1} · {label}
          </a>
        ))}
      </nav>

      <Section
        id="practice"
        title="1 · Practice"
        count={`${total} questions`}
        note="Tap a question for one worked path and a sanity check. It is a path, not the answer: swap in your own assumptions."
      >
        {questionSets.map((set) => (
          <Sub key={set.kind} title={set.kind} count={set.questions.length} note={set.note}>
            <ul className="mt-3 space-y-2">
              {set.questions.map((q) => (
                <Question key={q.q} q={q} />
              ))}
            </ul>
          </Sub>
        ))}
      </Section>

      <Section id="sizing" title={`2 · ${sizing.title}`}>
        <Sub title="Steps">
          <Steps items={sizing.steps} />
        </Sub>
        <Sub title="Worked example" note={sizing.example.q}>
          <div className="card mt-2 px-4 py-1">
            <WorkTable rows={sizing.example.work} />
          </div>
        </Sub>
      </Section>

      <Section id="drops" title={`3 · ${diagnosis.title}`} note={diagnosis.note}>
        <Sub title="Steps">
          <Steps items={diagnosis.steps} />
        </Sub>
        <Sub title="Sort the causes (MECE)" note={diagnosis.mece.note}>
          <div className="mt-2 grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2">
            {diagnosis.mece.buckets.map((b) => (
              <div key={b.label} className="bg-surface p-3">
                <p className="font-semibold text-text">{b.label}</p>
                <p className="mt-1 text-text-muted">{b.examples}</p>
              </div>
            ))}
          </div>
        </Sub>
        <Sub title="The ways a metric moves">
          <Tree root={diagnosis.tree.root} branches={diagnosis.tree.branches} />
        </Sub>
        <p className="mt-4 text-text-muted">
          More like this:{' '}
          <Link to="/browse?category=analytics&hard=1">the RCA questions in the bank</Link>.
        </p>
      </Section>

      <Section id="numbers" title={`4 · ${anchors.title}`} note={anchors.note}>
        <div className="card mt-3 px-4 py-1">
          <table className="w-full border-collapse">
            <tbody>
              {anchors.rows.map(([label, value]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-text">
                    {label}
                  </th>
                  <td className="py-2 text-right text-text-muted tabular-nums">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}
