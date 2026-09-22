import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { guesstimates } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Icon } from '../components/ui'
import Tree from '../components/diagrams/Tree'

// Charts and colour-coded groups use only these four, darkest to lightest.
const CHART_COLORS = ['var(--primary)', 'var(--chart-2)', 'var(--blue-300)', 'var(--blue-100)']

const KIND_ICONS = ['users', 'briefcase', 'code'] // population & scale, non-tech, tech

const JUMP = [
  ['practice', 'Practice'],
  ['sizing', 'How to size'],
  ['drops', 'Metric drops'],
  ['numbers', 'Numbers'],
]

/** A calculation ledger: label on the left, value on the right, rules between. */
function Ledger({ rows }) {
  return (
    <dl>
      {rows.map(([label, value]) => {
        const check = /sanity/i.test(label)
        return (
          <div
            key={label}
            className={`flex flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:gap-4 ${
              check ? '-mx-4 px-4' : ''
            }`}
            style={check ? { background: 'var(--accent-tint)' } : undefined}
          >
            <dt className="text-text sm:w-2/5 sm:shrink-0">{label}</dt>
            <dd className="m-0 text-text-muted">{value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

function AnswerPanel({ q, color }) {
  return (
    <div className="col-span-full overflow-hidden rounded-card border bg-surface" style={{ borderColor: color }}>
      <div className="px-4 pt-3">
        <p className="label">Working</p>
        <Ledger rows={q.steps} />
      </div>
      <div className="px-4 py-3" style={{ background: color, color: 'var(--white)' }}>
        <p className="label !text-current opacity-80">Answer</p>
        <p className="mt-1 text-section font-semibold">{q.answer}</p>
      </div>
      <div className="px-4 py-3" style={{ background: 'var(--accent-tint)' }}>
        <p className="label" style={{ color }}>Sanity check</p>
        <p className="mt-1 text-text">{q.check}</p>
      </div>
    </div>
  )
}

/** One kind of question: a panel, a header band, and a grid of question tiles. */
function KindBox({ set, color, icon }) {
  const [open, setOpen] = useState(null)
  return (
    <section className="panel mt-4 overflow-hidden">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3" style={{ background: 'var(--accent-tint)' }}>
        <span className="grid size-9 shrink-0 place-items-center rounded-button bg-surface" style={{ color }}>
          <Icon name={icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-section">{set.kind}</h3>
          <p className="text-text">{set.note}</p>
        </div>
        <span className="label shrink-0" style={{ color }}>{set.questions.length}</span>
      </header>
      <div className="grid grid-flow-dense gap-2 p-3 sm:grid-cols-2">
        {set.questions.map((q) => {
          const on = open === q.q
          return (
            <Fragment key={q.q}>
              <button
                type="button"
                className="flex min-h-11 flex-col items-start gap-1 rounded-button border px-3 py-2 text-left"
                style={{ borderColor: on ? color : 'var(--border)', background: on ? 'var(--accent-tint)' : 'var(--surface)' }}
                aria-expanded={on}
                onClick={() => setOpen(on ? null : q.q)}
              >
                <span className="text-text">{q.q}</span>
                <span className="label" style={{ color }}>{q.how}</span>
              </button>
              {on && <AnswerPanel q={q} color={color} />}
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}

/** Numbered steps as a grid of small boxes. */
function StepTiles({ items, color }) {
  return (
    <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((text, i) => (
        <li key={i} className="card flex gap-3 p-3">
          <span
            className="grid size-7 shrink-0 place-items-center rounded-pill text-body font-semibold"
            style={{ background: color, color: 'var(--white)' }}
          >
            {i + 1}
          </span>
          <span className="min-w-0 text-text">{text}</span>
        </li>
      ))}
    </ol>
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
        {questionSets.map((set, i) => (
          <KindBox key={set.kind} set={set} color={CHART_COLORS[i % CHART_COLORS.length]} icon={KIND_ICONS[i % KIND_ICONS.length]} />
        ))}
      </Section>

      <Section id="sizing" title={`2 · ${sizing.title}`}>
        <StepTiles items={sizing.steps} color={CHART_COLORS[0]} />

        <div className="panel mt-4 overflow-hidden">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3" style={{ background: 'var(--accent-tint)' }}>
            <span className="grid size-9 shrink-0 place-items-center rounded-button bg-surface" style={{ color: CHART_COLORS[0] }}>
              <Icon name="list" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="label" style={{ color: CHART_COLORS[0] }}>Worked example</p>
              <p className="font-semibold text-text">{sizing.example.q}</p>
            </div>
          </header>
          <div className="px-4 py-1">
            <Ledger rows={sizing.example.work} />
          </div>
        </div>
      </Section>

      <Section id="drops" title={`3 · ${diagnosis.title}`} note={diagnosis.note}>
        <StepTiles items={diagnosis.steps} color={CHART_COLORS[1]} />

        <p className="label mt-6">Sort the causes (MECE)</p>
        <p className="mt-1 text-text-muted">{diagnosis.mece.note}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {diagnosis.mece.buckets.map((b, i) => (
            <div key={b.label} className="panel overflow-hidden">
              <p className="px-4 py-3 font-semibold" style={{ background: 'var(--accent-tint)', color: CHART_COLORS[i % CHART_COLORS.length] }}>
                {b.label}
              </p>
              <p className="p-3 text-text-muted">{b.examples}</p>
            </div>
          ))}
        </div>

        <p className="label mt-6">The ways a metric moves</p>
        <div className="card mt-2 p-3">
          <Tree root={diagnosis.tree.root} branches={diagnosis.tree.branches} />
        </div>

        <p className="mt-4 text-text-muted">
          More like this:{' '}
          <Link to="/browse?category=analytics&hard=1">the RCA questions in the bank</Link>.
        </p>
      </Section>

      <Section id="numbers" title={`4 · ${anchors.title}`} note={anchors.note}>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {anchors.rows.map(([label, value]) => (
            <li key={label} className="card p-3">
              <p className="text-section font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>{value}</p>
              <p className="mt-1 text-text-muted">{label}</p>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  )
}
