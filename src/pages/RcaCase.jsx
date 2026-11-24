import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCase, getLesson } from '../data/learn'
import { logEvent } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import BackLink from '../components/BackLink'
import NotFound from './NotFound'

const WEIGHTS = { evidence: 0.35, diagnosis: 0.35, hypotheses: 0.15, recommendation: 0.15 }
const RATINGS = [
  ['unlikely', 'Unlikely'],
  ['unsure', 'Unsure'],
  ['likely', 'Likely'],
]
const DIFFICULTY = ['', 'Starter', 'Intermediate', 'Advanced']

function DataTable({ rows }) {
  const [head, ...body] = rows
  return (
    <div className="overflow-x-auto">
      <table className="mt-2 w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-border text-left">
            {head.map((h) => (
              <th key={h} scope="col" className="py-1 pr-4 font-semibold text-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r) => (
            <tr key={r.join('|')} className="border-b border-border">
              {r.map((c, i) => (
                <td key={`${c}-${i}`} className="py-1 pr-4 tabular-nums text-text-muted">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The score, by criterion, from what the learner did. Pure. */
export function scoreCase(c, { asked, ratings, picked, gaveUp, recommendationTicks }) {
  const keys = c.evidence.filter((e) => e.weight === 'key')
  const keyAsked = keys.filter((e) => asked.includes(e.id)).length
  const noiseAsked = c.evidence.filter((e) => e.weight === 'noise' && asked.includes(e.id)).length
  const keyShare = keys.length ? keyAsked / keys.length : 0
  const evidence = keyShare * (1 - Math.min(0.3, 0.1 * Math.max(0, noiseAsked - 2)))
  const diagnosis = !gaveUp && picked && c.hypotheses.find((h) => h.id === picked)?.cause ? 1 : 0
  const rated = c.hypotheses.map((h) => {
    const r = ratings[h.id] || 'unsure'
    if (r === 'unsure') return 0.5
    return (r === 'likely') === h.cause ? 1 : 0
  })
  const hypotheses = rated.reduce((n, x) => n + x, 0) / rated.length
  const recommendation = gaveUp ? 0 : recommendationTicks / c.recommendation.rubric.length
  const total = WEIGHTS.evidence * evidence + WEIGHTS.diagnosis * diagnosis + WEIGHTS.hypotheses * hypotheses + WEIGHTS.recommendation * recommendation
  return { evidence, diagnosis, hypotheses, recommendation, total, keyAsked, keyTotal: keys.length, noiseAsked }
}

const pct = (x) => `${Math.round(x * 100)}%`

export default function RcaCase() {
  const { slug } = useParams()
  const c = getCase(slug)
  if (!c) return <NotFound />
  return <Case key={c.slug} c={c} />
}

function Case({ c }) {
  useHead({
    title: `${c.title} — root cause case`,
    description: `${c.problem} A practice case with made-up data: ask for evidence, test hypotheses, find the cause.`.replace(/\s+/g, ' ').slice(0, 155),
    path: `/practice/rca/${c.slug}`,
  })
  const [phase, setPhase] = useState('investigate') // investigate | diagnose | result
  const [asked, setAsked] = useState([])
  const [ratings, setRatings] = useState({})
  const [revisions, setRevisions] = useState(0)
  const [hints, setHints] = useState(0)
  const [picked, setPicked] = useState('')
  const [rec, setRec] = useState('')
  const [gaveUp, setGaveUp] = useState(false)
  const [ticks, setTicks] = useState([])
  const [logged, setLogged] = useState(false)

  const groups = useMemo(() => [...new Set(c.evidence.map((e) => e.group))], [c])
  const unaskedKeys = c.evidence.filter((e) => e.weight === 'key' && !asked.includes(e.id))
  const result = phase === 'result' ? scoreCase(c, { asked, ratings, picked, gaveUp, recommendationTicks: ticks.length }) : null

  function ask(id) {
    if (!asked.includes(id)) setAsked((a) => [...a, id])
  }
  function rate(id, value) {
    setRatings((r) => {
      if ((r[id] || 'unsure') === value) return r
      if (asked.length > 0) setRevisions((n) => n + 1)
      return { ...r, [id]: value }
    })
  }
  function hint() {
    if (hints >= 2 || unaskedKeys.length === 0) return
    setHints((n) => n + 1)
  }
  function finish(giveUp) {
    setGaveUp(giveUp)
    setPhase('result')
  }
  function record(t) {
    // log once per attempt, after the learner has had the chance to tick the rubric
    if (logged) return
    setLogged(true)
    logEvent({ kind: 'rca', ref: c.slug, comps: c.competencies, level: c.difficulty === 1 ? 2 : 3, score: t, assisted: hints > 0 || gaveUp })
  }
  function restart() {
    setPhase('investigate')
    setAsked([])
    setRatings({})
    setRevisions(0)
    setHints(0)
    setPicked('')
    setRec('')
    setGaveUp(false)
    setTicks([])
    setLogged(false)
  }

  const hintText =
    hints === 0
      ? null
      : hints === 1
        ? `Look in the "${unaskedKeys[0]?.group || c.evidence[0].group}" group.`
        : `Ask: "${unaskedKeys[0]?.ask}"`

  return (
    <Page>
      <BackLink to="/practice" />
      <PageHead
        chapter={`Root cause case · ${DIFFICULTY[c.difficulty]}`}
        title={c.title}
        intro={`${c.company} · ${c.metric} · about ${c.minutes} min`}
      />
      <p className="card border-l-4 !border-l-accent p-3 text-text-muted">
        <span className="label !text-text">Made-up data</span> The numbers are invented for practice. The reasoning is real.
      </p>

      <section className="mt-6" aria-label="The situation">
        <p className="label">Background</p>
        <p className="mt-1 leading-relaxed text-text">{c.background}</p>
        <p className="label mt-4">Problem</p>
        <p className="mt-1 font-semibold leading-relaxed text-text">{c.problem}</p>
      </section>

      {phase !== 'result' && (
        <>
          <section className="mt-8" aria-labelledby="ask-h">
            <h2 id="ask-h" className="text-section">
              1 · Ask for evidence
            </h2>
            <p className="mt-1 text-text-muted">Each answer is added below. Ask what you need, not everything. The questions you ask are scored.</p>
            {groups.map((g) => (
              <div key={g} className="mt-4">
                <p className="label">{g}</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {c.evidence
                    .filter((e) => e.group === g)
                    .map((e) => {
                      const done = asked.includes(e.id)
                      return (
                        <li key={e.id}>
                          <button type="button" onClick={() => ask(e.id)} disabled={done || phase === 'diagnose'} aria-pressed={done} className="pill text-left">
                            {done ? '✓ ' : ''}
                            {e.ask}
                          </button>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
            <p className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={hint} disabled={hints >= 2 || unaskedKeys.length === 0} className="btn btn-sm">
                Hint ({2 - hints} left)
              </button>
              {hintText && (
                <span role="status" className="text-text">
                  {hintText} <span className="label">assisted</span>
                </span>
              )}
            </p>
          </section>

          <section className="mt-8" aria-labelledby="know-h">
            <h2 id="know-h" className="text-section">
              What you know
            </h2>
            {asked.length === 0 ? (
              <p className="card mt-2 p-4 text-text-muted">Nothing yet. Ask a question above.</p>
            ) : (
              <ol className="mt-2 space-y-3">
                {asked.map((id, i) => {
                  const e = c.evidence.find((x) => x.id === id)
                  return (
                    <li key={id} className="card p-3">
                      <p className="label">
                        {i + 1} · {e.ask}
                      </p>
                      {e.reveals && <p className="mt-1 leading-relaxed text-text">{e.reveals}</p>}
                      {e.table && <DataTable rows={e.table} />}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          <section className="mt-8" aria-labelledby="hyp-h">
            <h2 id="hyp-h" className="text-section">
              2 · Your hypotheses
            </h2>
            <p className="mt-1 text-text-muted">Rate each as evidence arrives. Changing your mind is part of the work.</p>
            <ul className="mt-2 border-t border-border">
              {c.hypotheses.map((h) => {
                const r = ratings[h.id] || 'unsure'
                return (
                  <li key={h.id} className="border-b border-border py-3">
                    <p className="text-text">{h.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Rate: ${h.text}`}>
                      {RATINGS.map(([v, label]) => (
                        <button key={v} type="button" aria-pressed={r === v} onClick={() => rate(h.id, v)} className="pill" disabled={phase === 'diagnose'}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
            {revisions > 0 && <p className="label mt-2">You have revised {revisions} {revisions === 1 ? 'rating' : 'ratings'}</p>}
          </section>

          <section className="mt-8" aria-labelledby="dx-h">
            <h2 id="dx-h" className="text-section">
              3 · Your diagnosis
            </h2>
            <fieldset className="mt-2">
              <legend className="label">Which is the root cause?</legend>
              <ul className="mt-1 space-y-1">
                {c.hypotheses.map((h) => (
                  <li key={h.id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-text">
                      <input type="radio" name="cause" className="size-5 accent-accent" checked={picked === h.id} onChange={() => setPicked(h.id)} />
                      <span>{h.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <label htmlFor="rec" className="label mt-4 block">
              What do you recommend? · saved nowhere, for you only
            </label>
            <textarea id="rec" value={rec} onChange={(e) => setRec(e.target.value)} rows={4} className="mt-1 w-full border border-border bg-surface p-3 text-[16px] text-text" />
            <p className="mt-3 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" disabled={!picked || asked.length === 0} onClick={() => finish(false)}>
                Submit diagnosis
              </button>
              <button type="button" className="btn" onClick={() => finish(true)}>
                Show the solution
              </button>
            </p>
            {(!picked || asked.length === 0) && <p className="mt-2 text-text-muted">Ask at least one question and pick a cause to submit.</p>}
          </section>
        </>
      )}

      {result && (
        <Result
          c={c}
          result={result}
          asked={asked}
          ratings={ratings}
          picked={picked}
          rec={rec}
          gaveUp={gaveUp}
          hints={hints}
          revisions={revisions}
          ticks={ticks}
          setTicks={setTicks}
          record={record}
          restart={restart}
          logged={logged}
        />
      )}
    </Page>
  )
}

function Result({ c, result, asked, ratings, picked, rec, gaveUp, hints, revisions, ticks, setTicks, record, restart, logged }) {
  const cause = c.hypotheses.find((h) => h.cause)
  const right = !gaveUp && picked === cause.id
  const rows = [
    ['Evidence gathering', result.evidence, `You asked for ${result.keyAsked} of ${result.keyTotal} key pieces of evidence${result.noiseAsked > 2 ? ` and ${result.noiseAsked} that did not help` : ''}.`],
    ['Diagnosis', result.diagnosis, right ? 'You found the root cause.' : gaveUp ? 'You asked for the solution.' : 'You chose a different cause.'],
    ['Hypothesis quality', result.hypotheses, 'How well your ratings matched the evidence, with "unsure" counted as half.'],
    ['Recommendation', result.recommendation, `You ticked ${ticks.length} of ${c.recommendation.rubric.length} rubric points against the model answer.`],
  ]
  // score and log once the learner has had the chance to self-check the recommendation
  const total = result.total
  return (
    <section className="mt-8" aria-labelledby="res-h">
      <h2 id="res-h" className="text-section">
        Result
      </h2>
      <p className="mt-1 text-section font-semibold text-text">
        {pct(total)} {hints > 0 || gaveUp ? <span className="label">assisted</span> : <span className="label">independent</span>}
      </p>
      <p className="mt-1 text-text-muted">
        {revisions > 0 ? `You revised ${revisions} ${revisions === 1 ? 'rating' : 'ratings'} as evidence arrived. ` : ''}
        This is a practice estimate. It does not predict an interview outcome.
      </p>

      <table className="mt-3 w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-1 pr-3 font-semibold">
              Criterion
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Score
            </th>
            <th scope="col" className="py-1 font-semibold">
              Feedback
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, s, text]) => (
            <tr key={name} className="border-b border-border align-top">
              <th scope="row" className="py-2 pr-3 text-left font-semibold text-text">
                {name}
              </th>
              <td className="py-2 pr-3 tabular-nums text-text">{pct(s)}</td>
              <td className="py-2 text-text-muted">{text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-6 font-semibold text-text">The root cause</h3>
      <p className="mt-1 leading-relaxed text-text">{cause.text}</p>
      <p className="mt-1 leading-relaxed text-text-muted">{cause.why}</p>

      <h3 className="mt-6 font-semibold text-text">What each piece of evidence told you</h3>
      <ul className="mt-2 border-t border-border">
        {c.evidence.map((e) => {
          const was = asked.includes(e.id)
          return (
            <li key={e.id} className="border-b border-border py-2">
              <p className="text-text">
                <span className="label mr-2">{was ? 'asked' : e.weight === 'noise' ? 'skipped' : 'not asked'}</span>
                {e.ask}
              </p>
              <p className="mt-1 text-text-muted">{e.insight}</p>
              {!was && e.weight === 'key' && <p className="label mt-1">key evidence you did not ask for</p>}
            </li>
          )
        })}
      </ul>

      <h3 className="mt-6 font-semibold text-text">Your hypotheses against the evidence</h3>
      <ul className="mt-2 border-t border-border">
        {c.hypotheses.map((h) => (
          <li key={h.id} className="border-b border-border py-2">
            <p className="text-text">
              {h.text} <span className="label ml-1">you: {ratings[h.id] || 'unsure'}</span>
            </p>
            <p className="mt-1 text-text-muted">{h.why}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 font-semibold text-text">How a strong answer reasons</h3>
      <p className="mt-1 leading-relaxed text-text-muted">{c.modelReasoning}</p>

      <h3 className="mt-6 font-semibold text-text">Recommendation</h3>
      {rec.trim() && (
        <div className="card mt-2 p-3">
          <p className="label">Yours</p>
          <p className="mt-1 whitespace-pre-wrap text-text">{rec}</p>
        </div>
      )}
      <div className="card mt-2 p-3">
        <p className="label">Model answer</p>
        <p className="mt-1 leading-relaxed text-text">{c.recommendation.model}</p>
        <fieldset className="mt-3">
          <legend className="label">Tick what your recommendation covered</legend>
          <ul className="mt-1 space-y-1">
            {c.recommendation.rubric.map((r) => (
              <li key={r}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-text">
                  <input
                    type="checkbox"
                    className="size-5 accent-accent"
                    checked={ticks.includes(r)}
                    disabled={logged || gaveUp}
                    onChange={(e) => setTicks((cur) => (e.target.checked ? [...cur, r] : cur.filter((x) => x !== r)))}
                  />
                  <span>{r}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>

      <h3 className="mt-6 font-semibold text-text">Common mistakes</h3>
      <ul className="mt-1 space-y-1">
        {c.mistakes.map((m) => (
          <li key={m} className="flex gap-3 text-text-muted">
            <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-text-muted" />
            <span>{m}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={logged} onClick={() => record(total)}>
          {logged ? 'Saved to your progress' : 'Save to my progress'}
        </button>
        <button type="button" className="btn" onClick={restart}>
          Try again
        </button>
        <Link to="/practice" className="btn no-underline hover:no-underline">
          More cases
        </Link>
      </p>
      <p className="mt-3 text-text-muted">
        <span className="label">Learn more</span>{' '}
        {c.learnMore.map((s, i) => (
          <span key={s}>
            {i > 0 && ', '}
            <Link to={`/learn/${s}`}>{getLesson(s).title}</Link>
          </span>
        ))}
      </p>
    </section>
  )
}
