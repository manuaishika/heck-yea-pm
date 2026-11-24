import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '../data/learn'
import { clearProfile, saveProfile, useProfile } from '../lib/learning'
import { dayKey } from '../lib/useActivity'
import { readJSON, writeJSON } from '../lib/storage'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const PERSONAS = [
  ['aspiring', 'I want to become a product manager', 'Foundations, discovery, product sense, analytics, then interview practice.'],
  ['working', 'I am a product manager and want to improve', 'Find the gaps, then harder cases and timed practice.'],
  ['technical', 'I want a technical product role', 'APIs, data, systems and AI, then technical cases and interviews.'],
]
const TARGETS = [
  ['first-role', 'My first product role'],
  ['next-role', 'My next product role'],
  ['technical-role', 'A technical product role'],
  ['current-job', 'Doing my current job better'],
]
const HOURS = [2, 5, 10]
const TECH = [
  ['none', 'New to it'],
  ['some', 'Some'],
  ['strong', 'Strong'],
]

export default function Start() {
  useHead({
    title: 'Set up your path',
    description: 'Tell us your goal, your time and your technical level. You get a learning path of lessons, cases and practice. Everything stays on your device.',
    path: '/start',
  })
  const existing = useProfile()
  const navigate = useNavigate()
  const [persona, setPersona] = useState(existing?.persona || '')
  const [target, setTarget] = useState(existing?.target || '')
  const [hours, setHours] = useState(existing?.hours || 5)
  const [tech, setTech] = useState(existing?.tech || 'some')
  const [date, setDate] = useState(() => {
    const d = readJSON('pp.interview', '')
    return typeof d === 'string' ? d : ''
  })

  function submit(e) {
    e.preventDefault()
    if (!persona) return
    saveProfile({ persona, target, hours, tech, skip: existing?.skip || [] })
    if (date) writeJSON('pp.interview', date)
    navigate('/progress')
  }

  return (
    <Page>
      <PageHead
        chapter="Your path"
        title={existing ? 'Edit your goals' : 'Set up your path'}
        intro="Three questions. Only the first is required. It stays on your device, and you can change it any time."
      />
      <form onSubmit={submit}>
        <fieldset>
          <legend className="font-semibold text-text">1 · Where are you?</legend>
          <ul className="mt-2 space-y-2">
            {PERSONAS.map(([k, name, line]) => (
              <li key={k}>
                <label className={`card flex cursor-pointer items-start gap-3 p-3 ${persona === k ? '!border-accent bg-accent-tint' : ''}`}>
                  <input type="radio" name="persona" className="mt-1 size-5 accent-accent" checked={persona === k} onChange={() => setPersona(k)} />
                  <span>
                    <span className="block font-semibold text-text">{name}</span>
                    <span className="block text-text-muted">{line}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="font-semibold text-text">2 · What are you aiming for? <span className="label">optional</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TARGETS.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={target === k} onClick={() => setTarget(target === k ? '' : k)} className="pill">
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="font-semibold text-text">3 · Time and technical level <span className="label">optional</span></legend>
          <p className="label mt-2">Hours a week</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {HOURS.map((h) => (
              <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className="pill">
                {h} hours
              </button>
            ))}
          </div>
          <p className="label mt-3">Technical background</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {TECH.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={tech === k} onClick={() => setTech(k)} className="pill">
                {label}
              </button>
            ))}
          </div>
          <label htmlFor="start-date" className="label mt-3 block">
            Interview date
          </label>
          <input id="start-date" type="date" min={dayKey()} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 min-h-11 border border-border bg-surface px-3 text-[16px] text-text" />
        </fieldset>

        {persona && (
          <p className="card mt-6 border-l-4 !border-l-accent p-3 text-text-muted">
            <span className="label !text-text">Your path</span> {paths[persona].name}. {paths[persona].goal}
          </p>
        )}

        <p className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary" disabled={!persona}>
            {existing ? 'Save changes' : 'Build my path'}
          </button>
          {existing && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                clearProfile()
                setPersona('')
              }}
            >
              Clear my profile
            </button>
          )}
        </p>
        {!persona && <p className="mt-2 text-text-muted">Pick where you are to continue.</p>}
      </form>
    </Page>
  )
}
