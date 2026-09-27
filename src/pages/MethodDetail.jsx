import { useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMethod, questionsForMethod, exampleQuestion } from '../lib/methods'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Block, CategoryTag } from '../components/ui'
import BackLink from '../components/BackLink'
import MethodDiagram from '../components/diagrams/MethodDiagram'
import NotFound from './NotFound'

const RELATED_SHOWN = 5

/** The worked example, closed by default: the question, then one box per
 * step of the answer. */
function WorkedExample({ method }) {
  const [open, setOpen] = useState(false)
  const panel = useId()
  const example = exampleQuestion(method)

  return (
    <section className="card mt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left"
      >
        <span className="label">Worked example</span>
        <span className="text-text-muted">{open ? 'Hide −' : 'Show +'}</span>
      </button>
      <div id={panel} hidden={!open} className="border-t border-border p-4">
        <Link to={`/browse/${example.id}`} className="font-semibold">
          {example.question}
        </Link>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {method.example.work.map(([label, text], i) => (
            <li key={label} className="border border-ink bg-page p-3">
              <p className="flex items-baseline gap-2">
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-semibold text-text">{label}</span>
              </p>
              <p className="mt-1 text-text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-label text-text-muted">An illustrative answer shape. Use your own story and numbers.</p>
      </div>
    </section>
  )
}

function RelatedQuestions({ list }) {
  const [all, setAll] = useState(false)
  const shown = all ? list : list.slice(0, RELATED_SHOWN)
  return (
    <section className="mt-8">
      <p className="label">Related questions · {list.length}</p>
      <ul className="mt-2 divide-y divide-border border-y border-border">
        {shown.map((q) => (
          <li key={q.id}>
            <Link
              to={`/browse/${q.id}`}
              className="flex min-h-11 items-center gap-3 py-2 text-text no-underline hover:text-accent hover:no-underline"
            >
              <span className="min-w-0 flex-1">{q.question}</span>
              <span aria-hidden="true" className="text-text-muted">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length > RELATED_SHOWN && (
        <button type="button" onClick={() => setAll((v) => !v)} className="btn btn-sm mt-3">
          {all ? 'Show fewer' : `Show all ${list.length}`}
        </button>
      )}
    </section>
  )
}

export default function MethodDetail() {
  const { slug } = useParams()
  const m = getMethod(slug)

  useHead({
    title: m ? `${m.name} — answering method` : 'Method not found',
    description: m ? `${m.when} Steps, a worked example, and the common failure.` : '',
    path: `/methods/${slug}`,
  })

  if (!m) return <NotFound />

  return (
    <Page>
      <BackLink to="/methods" />
      <PageHead
        chapter={
          <Link to="/methods" className="no-underline hover:no-underline">
            Methods
          </Link>
        }
        title={m.name}
        intro={m.when}
        aside={
          <ul className="flex shrink-0 flex-wrap gap-2">
            {m.categories.map((c) => (
              <li key={c}>
                <CategoryTag category={c} to={`/browse?category=${c.toLowerCase().replace(/\s+/g, '-')}`} />
              </li>
            ))}
          </ul>
        }
      />

      <div className="card p-4 sm:p-6">
        <MethodDiagram method={m} />
      </div>

      <WorkedExample method={m} />

      <div className="card mt-4">
        <Block label="Common failure" rule={false}>
          <p>{m.failure}</p>
        </Block>
      </div>

      <RelatedQuestions list={questionsForMethod(m)} />
    </Page>
  )
}
