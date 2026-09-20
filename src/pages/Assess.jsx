import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { allSkills } from '../data/guides'
import { categorySlug } from '../data/questions'
import { useAssessment, RATINGS } from '../lib/useAssessment'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

function Result({ ratings }) {
  const rated = allSkills.filter((s) => s.slug in ratings)

  const weak = useMemo(
    () =>
      [...rated]
        .sort((a, b) => ratings[a.slug] - ratings[b.slug])
        .filter((s) => ratings[s.slug] < 2)
        .slice(0, 5),
    [rated, ratings]
  )

  if (rated.length === 0) {
    return (
      <p className="prose-body mt-4 border-t border-rule pt-4">
        Rate a few skills above and a starting point appears here.
      </p>
    )
  }

  if (weak.length === 0) {
    return (
      <div className="mt-6 border-t-2 border-rule-hard pt-4">
        <p className="label !text-ink">Start here</p>
        <p className="prose-body mt-1">
          You rated yourself okay or solid on everything you&apos;ve marked. Skip
          the drilling and go straight to the{' '}
          <Link to="/browse">question bank</Link> and the{' '}
          <Link to="/companies">company loops</Link>. Revisit this if a mock
          interview says otherwise.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t-2 border-rule-hard pt-4">
      <p className="label !text-ink">Start here</p>
      <p className="prose-body mt-1">
        Weakest first. Read the skill, then work its questions.
      </p>
      <ol className="mt-2">
        {weak.map((s) => (
          <li key={s.slug} className="border-t border-rule py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink">{s.name}</span>
              <span className="label shrink-0">
                {RATINGS[ratings[s.slug]].label.toLowerCase()}
              </span>
            </div>
            <p className="mt-1 flex gap-3 text-sm">
              <Link to={`/skills#${s.slug}`}>Read the skill</Link>
              <Link to={`/browse?category=${categorySlug(s.bankCategory)}`}>
                {s.bankCategory} questions
              </Link>
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Assess() {
  const { ratings, rate, reset, canPersist } = useAssessment()
  useHead({
    title: 'Self-assessment',
    description:
      'Rate yourself on each PM skill and get an honest starting point for what to prepare first.',
    path: '/skills/assess',
  })

  const ratedCount = Object.keys(ratings).length

  return (
    <Page>
      <PageHead
        chapter="Chapter 2"
        title="Where do you stand?"
        intro="Rate each skill honestly. The output tells you what to fix first — it will not flatter you."
      />

      {!canPersist && (
        <p className="prose-body mt-3">
          This browser is not storing data, so your answers will not be here when
          you come back.
        </p>
      )}

      <p aria-live="polite" className="label mt-4">
        {ratedCount} of {allSkills.length} rated
        {ratedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="chip ml-3"
          >
            reset
          </button>
        )}
      </p>

      <div className="mt-2">
        {allSkills.map((s) => {
          const current = ratings[s.slug]
          return (
            <fieldset key={s.slug} className="border-t border-rule py-2.5">
              <legend className="text-sm text-ink">{s.assess}</legend>
              <div className="mt-1.5 flex gap-1.5">
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => rate(s.slug, r.value)}
                    aria-pressed={current === r.value}
                    className="chip"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>

      <Result ratings={ratings} />
    </Page>
  )
}
