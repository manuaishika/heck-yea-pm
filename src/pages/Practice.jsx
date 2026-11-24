import { Link } from 'react-router-dom'
import { cases, exercises } from '../data/learn'
import { useEvents } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const DIFFICULTY = ['', 'Starter', 'Intermediate', 'Advanced']

function Row({ to, title, sub, done }) {
  return (
    <li className="flex items-start gap-3 border-b border-border py-3">
      <span aria-hidden="true" className={`mt-1 grid size-6 shrink-0 place-items-center border text-label font-semibold ${done ? 'border-accent bg-accent text-surface' : 'border-border text-text-muted'}`}>
        {done ? '✓' : ''}
      </span>
      <div className="min-w-0">
        <Link to={to} className="font-semibold text-text no-underline hover:underline">
          {title}
        </Link>
        <p className="text-text-muted">{sub}</p>
        {done && <span className="sr-only">(attempted)</span>}
      </div>
    </li>
  )
}

export default function Practice() {
  useHead({
    title: 'Practice',
    description:
      'Practice that asks you to think: diagnose a metric drop with evidence on request, sort what you know about a user, and run a timed mock interview.',
    path: '/practice',
  })
  const events = useEvents()
  const did = (kind, ref) => events.some((e) => e.kind === kind && e.ref === ref)
  return (
    <Page>
      <PageHead chapter="Practice" title="Practice" intro="Cases and exercises that make you ask, sort and decide. The data is made up. The reasoning is real." />

      <section aria-labelledby="rca-h">
        <h2 id="rca-h" className="text-section">
          Root cause cases
        </h2>
        <p className="mt-1 text-text-muted">A number moved. Ask for evidence, test hypotheses, find the cause, and say what to do.</p>
        <ul className="mt-2 border-t border-border">
          {cases.map((c) => (
            <Row key={c.slug} to={`/practice/rca/${c.slug}`} title={c.title} sub={`${DIFFICULTY[c.difficulty]} · ${c.company} · about ${c.minutes} min`} done={did('rca', c.slug)} />
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="con-h">
        <h2 id="con-h" className="text-section">
          Consumer lab
        </h2>
        <p className="mt-1 text-text-muted">Sort facts from statements, assumptions and hypotheses, then choose the evidence you still need.</p>
        <ul className="mt-2 border-t border-border">
          {exercises.map((e) => (
            <Row key={e.slug} to={`/practice/consumer/${e.slug}`} title={e.title} sub={`${e.job} About ${e.minutes} min.`} done={did('consumer', e.slug)} />
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="int-h">
        <h2 id="int-h" className="text-section">
          Interviews
        </h2>
        <ul className="mt-2 border-t border-border">
          <Row to="/interview" title="Mock interview" sub="Timed answers, follow-ups and a four-part rubric." done={events.some((e) => e.kind === 'interview')} />
          <Row to="/browse" title="Question bank" sub="Every question, with the model answer and the mistake that sinks most candidates." />
          <Row to="/today" title="Today’s question" sub="One question a day, with a streak." />
          <Row to="/guesstimates" title="Guesstimates" sub="Sizing questions with worked paths." />
        </ul>
      </section>
    </Page>
  )
}
