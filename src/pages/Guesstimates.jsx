import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { guesstimates } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Icon } from '../components/ui'
import Tree from '../components/diagrams/Tree'

/* Each kind of question gets its own tone and icon, so the three boxes read as
   three different things. Tones are neutral names for the shared colour pairs. */
const KINDS = [
  { tone: '4', icon: 'users' }, // population & scale
  { tone: '1', icon: 'briefcase' }, // non-tech product
  { tone: '2', icon: 'code' }, // tech product
]
const BUCKET_TONES = { System: '4', Internal: '1', External: '3', 'Out of control': '6' }

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
              check ? 'tone-fill -mx-4 px-4' : ''
            }`}
          >
            <dt className="text-text sm:w-2/5 sm:shrink-0">{label}</dt>
            <dd className="m-0 text-text-muted">{value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

function AnswerPanel({ q }) {
  return (
    <div className="col-span-full overflow-hidden rounded-card border bg-surface" style={{ borderColor: 'var(--c)' }}>
      <div className="px-4 pt-3">
        <p className="label">Working</p>
        <Ledger rows={q.steps} />
      </div>
      <div className="tone-solid px-4 py-3">
        <p className="label !text-current opacity-80">Answer</p>
        <p className="mt-1 text-section font-semibold">{q.answer}</p>
      </div>
      <div className="tone-fill px-4 py-3">
        <p className="label tone-ink">Sanity check</p>
        <p className="mt-1 text-text">{q.check}</p>
      </div>
    </div>
  )
}

/** One kind of question: a box, a header band, and a grid of question tiles. */
function KindBox({ set, tone, icon }) {
  const [open, setOpen] = useState(null)
  return (
    <section data-tone={tone} className="tone-box mt-4">
      <header className="tone-head">
        <span className="tone-ink grid size-9 shrink-0 place-items-center rounded-button bg-surface">
          <Icon name={icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-section">{set.kind}</h3>
          <p className="text-text">{set.note}</p>
        </div>
        <span className="label tone-ink shrink-0">{set.questions.length}</span>
      </header>
      <div className="grid grid-flow-dense gap-2 p-3 sm:grid-cols-2">
        {set.questions.map((q) => {
          const on = open === q.q
          return (
            <Fragment key={q.q}>
              <button
                type="button"
                className="tone-tile"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : q.q)}
              >
                <span className="text-text">{q.q}</span>
                <span className="label tone-ink">{q.how}</span>
              </button>
              {on && <AnswerPanel q={q} />}
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}

/** Numbered steps as a grid of small boxes. */
function StepTiles({ items, tone }) {
  return (
    <ol data-tone={tone} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((text, i) => (
        <li key={i} className="card flex gap-3 p-3">
          <span className="tone-solid grid size-7 shrink-0 place-items-center rounded-pill text-body font-semibold">
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
          <KindBox key={set.kind} set={set} {...KINDS[i % KINDS.length]} />
        ))}
      </Section>

      <Section id="sizing" title={`2 · ${sizing.title}`}>
        <StepTiles items={sizing.steps} tone="5" />

        <div data-tone="5" className="tone-box mt-4">
          <header className="tone-head">
            <span className="tone-ink grid size-9 shrink-0 place-items-center rounded-button bg-surface">
              <Icon name="list" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="label tone-ink">Worked example</p>
              <p className="font-semibold text-text">{sizing.example.q}</p>
            </div>
          </header>
          <div className="px-4 py-1">
            <Ledger rows={sizing.example.work} />
          </div>
        </div>
      </Section>

      <Section id="drops" title={`3 · ${diagnosis.title}`} note={diagnosis.note}>
        <StepTiles items={diagnosis.steps} tone="2" />

        <p className="label mt-6">Sort the causes (MECE)</p>
        <p className="mt-1 text-text-muted">{diagnosis.mece.note}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {diagnosis.mece.buckets.map((b) => (
            <div key={b.label} data-tone={BUCKET_TONES[b.label] || '5'} className="tone-box">
              <p className="tone-head tone-ink font-semibold">{b.label}</p>
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
        <ul data-tone="3" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {anchors.rows.map(([label, value]) => (
            <li key={label} className="card p-3">
              <p className="tone-ink text-section font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-text-muted">{label}</p>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  )
}
