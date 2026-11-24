import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getExercise } from '../data/learn'
import { logEvent } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import BackLink from '../components/BackLink'
import NotFound from './NotFound'

export const KINDS = [
  ['fact', 'Fact'],
  ['statement', 'Statement'],
  ['assumption', 'Assumption'],
  ['hypothesis', 'Hypothesis'],
]
const KIND_NAME = Object.fromEntries(KINDS)
const pct = (x) => `${Math.round(x * 100)}%`

/** Score an attempt. Pure. */
export function scoreExercise(ex, { sorted, evidence, hypothesis }) {
  const claims = ex.claims.filter((c, i) => sorted[i] === c.kind).length / ex.claims.length
  const useful = ex.evidenceNeeded.filter((e) => e.useful)
  const usefulPicked = useful.filter((e) => evidence.includes(e.text)).length
  const uselessPicked = evidence.filter((t) => !ex.evidenceNeeded.find((e) => e.text === t)?.useful).length
  const ev = Math.max(0, Math.min(1, usefulPicked / useful.length - 0.25 * uselessPicked))
  const hyp = ex.hypothesisOptions.find((h) => h.text === hypothesis)?.good ? 1 : 0
  return { claims, evidence: ev, hypothesis: hyp, total: 0.5 * claims + 0.25 * ev + 0.25 * hyp }
}

export default function ConsumerExercise() {
  const { slug } = useParams()
  const ex = getExercise(slug)
  if (!ex) return <NotFound />
  return <Exercise key={ex.slug} ex={ex} />
}

function Exercise({ ex }) {
  useHead({
    title: `${ex.title} — consumer lab`,
    description: `${ex.job} A practice exercise with made-up notes.`.replace(/\s+/g, ' ').slice(0, 155),
    path: `/practice/consumer/${ex.slug}`,
  })
  const [sorted, setSorted] = useState({})
  const [evidence, setEvidence] = useState([])
  const [hypothesis, setHypothesis] = useState('')
  const [result, setResult] = useState(null)

  const ready = ex.claims.every((_, i) => sorted[i]) && hypothesis
  function submit() {
    const r = scoreExercise(ex, { sorted, evidence, hypothesis })
    setResult(r)
    logEvent({ kind: 'consumer', ref: ex.slug, comps: ex.competencies, level: ex.level, score: r.total })
  }
  function again() {
    setSorted({})
    setEvidence([])
    setHypothesis('')
    setResult(null)
  }

  return (
    <Page>
      <BackLink to="/practice" />
      <PageHead chapter="Consumer lab" title={ex.title} intro={`${ex.job} About ${ex.minutes} min.`} />
      <p className="card border-l-4 !border-l-accent p-3 text-text-muted">
        <span className="label !text-text">Made-up notes</span> The people and numbers are invented for practice.
      </p>

      <section className="mt-6" aria-label="Scenario">
        <p className="leading-relaxed text-text">{ex.scenario}</p>
        <div className="mt-3 space-y-3">
          {ex.material.map((m) => (
            <div key={m.label} className="card p-3">
              <p className="label">{m.label}</p>
              <p className="mt-1 leading-relaxed text-text">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="sort-h">
        <h2 id="sort-h" className="text-section">
          1 · Sort each claim
        </h2>
        <p className="mt-1 text-text-muted">
          Fact: seen or measured. Statement: what someone said. Assumption: believed without evidence. Hypothesis: a testable claim with a measure.
        </p>
        <ul className="mt-2 border-t border-border">
          {ex.claims.map((c, i) => {
            const mine = sorted[i]
            const right = result && mine === c.kind
            return (
              <li key={c.text} className="border-b border-border py-3">
                <p className="text-text">{c.text}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Sort: ${c.text}`}>
                  {KINDS.map(([k, label]) => (
                    <button key={k} type="button" disabled={Boolean(result)} aria-pressed={mine === k} onClick={() => setSorted((s) => ({ ...s, [i]: k }))} className="pill">
                      {label}
                    </button>
                  ))}
                </div>
                {result && (
                  <p className={`card mt-2 border-l-4 p-3 text-text-muted ${right ? '!border-l-correct' : '!border-l-wrong'}`}>
                    <span className="label !text-text">
                      {right ? '✓ Right' : `✗ This is a ${KIND_NAME[c.kind].toLowerCase()}`}
                    </span>{' '}
                    {c.why}
                    {c.overgeneralises && (
                      <span className="mt-1 block font-semibold text-text">
                        Watch out: this generalises from one person or one moment{mine === 'fact' ? ', and you called it a fact' : ''}.
                      </span>
                    )}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="ev-h">
        <h2 id="ev-h" className="text-section">
          2 · What evidence would you ask for next?
        </h2>
        <p className="mt-1 text-text-muted">Pick what would most change your mind. Picking everything costs points.</p>
        <ul className="mt-2 space-y-1">
          {ex.evidenceNeeded.map((e) => (
            <li key={e.text}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-text">
                <input
                  type="checkbox"
                  className="mt-1 size-5 accent-accent"
                  disabled={Boolean(result)}
                  checked={evidence.includes(e.text)}
                  onChange={(ev) => setEvidence((cur) => (ev.target.checked ? [...cur, e.text] : cur.filter((x) => x !== e.text)))}
                />
                <span>
                  {e.text}
                  {result && (
                    <span className="mt-1 block text-text-muted">
                      <span className="label !text-text">{e.useful ? 'useful' : 'low value'}</span> {e.why}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="hy-h">
        <h2 id="hy-h" className="text-section">
          3 · Choose the best hypothesis
        </h2>
        <ul className="mt-2 space-y-1">
          {ex.hypothesisOptions.map((h) => (
            <li key={h.text}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-text">
                <input type="radio" name="hyp" className="mt-1 size-5 accent-accent" disabled={Boolean(result)} checked={hypothesis === h.text} onChange={() => setHypothesis(h.text)} />
                <span>
                  {h.text}
                  {result && (
                    <span className="mt-1 block text-text-muted">
                      <span className="label !text-text">{h.good ? 'testable' : 'not testable'}</span> {h.why}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {!result ? (
        <p className="mt-6">
          <button type="button" className="btn btn-primary" disabled={!ready} onClick={submit}>
            Check my work
          </button>
          {!ready && <span className="ml-3 text-text-muted">Sort every claim and pick a hypothesis.</span>}
        </p>
      ) : (
        <section className="mt-8" aria-labelledby="out-h" role="status">
          <h2 id="out-h" className="text-section">
            Result · {pct(result.total)}
          </h2>
          <table className="mt-2 w-full border-collapse text-body">
            <tbody>
              {[
                ['Sorting claims', result.claims],
                ['Choosing evidence', result.evidence],
                ['Writing a hypothesis', result.hypothesis],
              ].map(([n, s]) => (
                <tr key={n} className="border-b border-border">
                  <th scope="row" className="py-2 pr-3 text-left font-semibold text-text">
                    {n}
                  </th>
                  <td className="py-2 tabular-nums text-text-muted">{pct(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="mt-5 font-semibold text-text">Takeaways</h3>
          <ul className="mt-1 space-y-1">
            {ex.takeaways.map((t) => (
              <li key={t} className="flex gap-3 text-text-muted">
                <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-text-muted" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={again}>
              Try again
            </button>
            <Link to="/practice" className="btn no-underline hover:no-underline">
              More practice
            </Link>
            <Link to="/learn/facts-vs-assumptions" className="btn no-underline hover:no-underline">
              Read the lesson
            </Link>
          </p>
        </section>
      )}
    </Page>
  )
}
