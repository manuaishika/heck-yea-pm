import { Link, useParams } from 'react-router-dom'
import { getMethod, questionsForMethod, exampleQuestion } from '../lib/methods'
import { categorySlug } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Block, WorkTable, CategoryTag } from '../components/ui'
import NotFound from './NotFound'

export default function MethodDetail() {
  const { slug } = useParams()
  const m = getMethod(slug)

  useHead({
    title: m ? `${m.name} — answering method` : 'Method not found',
    description: m ? `${m.when} Steps, a worked example, and the common failure.` : '',
    path: `/methods/${slug}`,
  })

  if (!m) return <NotFound />

  const example = exampleQuestion(m)
  const applies = questionsForMethod(m)

  return (
    <Page>
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

      <div className="card">
        <Block label="Steps" rule={false}>
          <ol className="space-y-3">
            {m.steps.map(([label, detail], i) => (
              <li key={label} className="flex gap-3">
                <span className="w-5 shrink-0 tabular-nums text-text-muted" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold text-text">{label}.</span>{' '}
                  <span className="text-text-muted">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Block>

        <Block label="Worked example">
          <p>
            <Link to={`/browse/${example.id}`} className="font-semibold">
              {example.question}
            </Link>
          </p>
          <div className="mt-2">
            <WorkTable rows={m.example.work} />
          </div>
          <p className="mt-2 text-text-muted">An illustrative answer shape. Use your own story and numbers.</p>
        </Block>

        <Block label="Common failure">
          <p>{m.failure}</p>
        </Block>
      </div>

      <section className="mt-8">
        <p className="label">
          Questions it applies to · {applies.length}
        </p>
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {applies.map((q) => (
            <li key={q.id}>
              <Link
                to={`/browse/${q.id}`}
                className="flex min-h-11 items-center gap-3 py-2 text-text no-underline hover:text-accent hover:no-underline"
              >
                <span className="min-w-0 flex-1">{q.question}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}
