import { useParams, Link, Navigate } from 'react-router-dom'
import { companies, getCompany, questionsForCompany } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Block } from '../components/ui'
import { CompanyLogoLink } from '../components/CompanyMark'
import { standoutsFor } from '../lib/companyMeta'
import QuestionList from '../components/QuestionList'
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
  const standout = standoutsFor(c)

  useHead({
    title: `${c.name} PM interview`,
    description: `${c.name}: ${c.rounds.length}-round ${c.program} loop. ${c.format}`.slice(0, 155),
    path: `/companies/${c.slug}`,
  })

  const hasLoop = c.rounds.length > 0

  return (
    <Page>
      <PageHead
        chapter={
          <Link to="/companies" className="no-underline hover:no-underline">
            Companies
          </Link>
        }
        title={c.name}
        intro={
          hasLoop
            ? `${c.region} · ${c.program} · ${c.rounds.length} rounds`
            : `${c.region} · ${c.sector} · ${c.program}`
        }
        aside={<CompanyLogoLink name={c.name} size="size-10" />}
      />

      {hasLoop ? (
        <>
          {!c.verified && (
            <p className="card p-4 text-text-muted">
              Unverified — pieced together from public candidate reports. Confirm the current
              format with your recruiter.
            </p>
          )}

          <h2 className="mt-6">The loop</h2>
          <LoopFlow rounds={c.rounds} />

          <h2 className="mt-8">What they weight</h2>
          <div className="mt-2">
            <WeightBars weights={c.weights} standout={standout} />
          </div>
          {standout.length > 0 && (
            <p className="mt-2 text-text-muted">
              <span className="font-semibold text-accent">★ {standout.join(', ')}</span> — weighted
              more here than at most companies.
            </p>
          )}

          <div className="card mt-8">
            <Block label="How it feels" rule={false}>
              <p className="text-text-muted">
                <Rich>{c.format}</Rich>
              </p>
            </Block>
            <Block label="Prep this specifically">
              <p>
                <Rich>{c.whatToKnow}</Rich>
              </p>
            </Block>
          </div>
        </>
      ) : (
        <div className="card p-4">
          <p className="text-text-muted">
            No verified round-by-round loop for {c.name} yet — we haven&rsquo;t found a real,
            citable source for it. Here&rsquo;s what we know: {c.sector} · {c.region}. {c.program}.
          </p>
          <p className="mt-3">
            <a
              href={c.careersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary no-underline hover:no-underline"
            >
              Their careers page ↗
            </a>
          </p>
        </div>
      )}

      <h2 className="mt-8">Questions seen at {c.name}</h2>
      {tagged.length > 0 ? (
        <div className="mt-2">
          <QuestionList questions={tagged} linkTo={(q) => `/browse/${q.id}`} />
        </div>
      ) : (
        <p className="mt-2 text-text-muted">
          None tagged yet. Work the heavy categories above from the{' '}
          <Link to="/browse">question bank</Link>.
        </p>
      )}
    </Page>
  )
}
