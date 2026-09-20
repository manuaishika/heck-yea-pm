import { useParams, Link, Navigate } from 'react-router-dom'
import { companies, getCompany, questionsForCompany } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'
import Rich from '../components/Rich'
import LoopFlow from '../components/diagrams/LoopFlow'
import WeightBars from '../components/diagrams/WeightBars'
import NotFound from './NotFound'

function resolveSlug(raw) {
  if (typeof raw !== 'string') return null
  const cleaned = raw.trim().replace(/\/+$/, '').toLowerCase()
  const match = companies.find((c) => c.slug.toLowerCase() === cleaned)
  return match ? match.slug : null
}

export default function CompanyDetail() {
  const { slug } = useParams()
  const canonical = resolveSlug(slug)

  if (!canonical) return <NotFound />
  if (canonical !== slug) return <Navigate to={`/companies/${canonical}`} replace />

  const c = getCompany(canonical)
  const tagged = questionsForCompany(c)

  useHead({
    title: `${c.name} PM interview`,
    description: `${c.name}: ${c.rounds.length}-round ${c.program} loop. ${c.format}`.slice(0, 155),
    path: `/companies/${c.slug}`,
  })

  return (
    <Page>
      <p className="label">
        <Link to="/companies">Companies</Link>
      </p>

      <header className="mt-4 border-b-2 border-rule-hard pb-4">
        <h1 className="text-2xl">{c.name}</h1>
        <p className="label mt-1">
          {c.region} · {c.program} · {c.rounds.length} rounds
        </p>
      </header>

      {!c.verified && (
        <p className="mt-4 border-l-4 border-accent pl-3 text-sm text-ink-dim">
          Unverified — pieced together from public candidate reports. Confirm the
          current format with your recruiter.
        </p>
      )}

      {/* the loop, as a stepper */}
      <h2 className="mt-6 text-lg">The loop</h2>
      <LoopFlow rounds={c.rounds} />

      {/* what they weight */}
      <h2 className="mt-8 text-lg">What they weight</h2>
      <WeightBars weights={c.weights} />

      {/* format + what to know */}
      <h2 className="mt-8 text-lg">How it feels</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-dim">
        <Rich>{c.format}</Rich>
      </p>
      <p className="mt-3 border-l-4 border-accent pl-3 text-sm text-ink">
        <span className="label !text-ink">Prep this specifically</span>
        <span className="mt-1 block">
          <Rich>{c.whatToKnow}</Rich>
        </span>
      </p>

      {/* tagged questions */}
      <h2 className="mt-8 text-lg">Questions seen at {c.name}</h2>
      {tagged.length > 0 ? (
        <ul className="mt-2">
          {tagged.map((q) => (
            <li key={q.id} className="border-b border-rule last:border-0">
              <Link
                to={`/browse/${q.id}`}
                className="block py-2 text-sm text-ink no-underline hover:text-accent"
              >
                {q.question}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-dim">
          None tagged yet. Work the heavy categories above from the{' '}
          <Link to="/browse">question bank</Link>.
        </p>
      )}
    </Page>
  )
}
