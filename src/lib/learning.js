import { createStore, useStore } from './store'
import { useQuiz } from './useQuiz'
import { quiz } from '../data/guides'
import { competencies, competencyData, levels, lessons, paths } from '../data/learn'
import { allCompetencies, eventsFromQuiz, isWeak } from './competency'
import { buildPath, prioritise } from './path'

// Everything a learner does is stored on the device only. No account, no upload.

const MAX_EVENTS = 400

const events = createStore('pp.progress.v1', [], (x) =>
  Array.isArray(x) ? x.filter((e) => e && Array.isArray(e.comps) && typeof e.score === 'number').slice(-MAX_EVENTS) : []
)
const profile = createStore('pp.profile.v1', null, (x) =>
  x && typeof x === 'object' && ['aspiring', 'working', 'technical'].includes(x.persona) ? x : null
)
const learn = createStore('pp.learn.v1', { saved: [], done: [], notes: {} }, (x) => ({
  saved: Array.isArray(x?.saved) ? x.saved : [],
  done: Array.isArray(x?.done) ? x.done : [],
  notes: x?.notes && typeof x.notes === 'object' ? x.notes : {},
}))

/** Record one scored attempt. */
export function logEvent(ev) {
  events.set([...events.get(), { t: Date.now(), self: false, assisted: false, ...ev }].slice(-MAX_EVENTS))
}

export const useEvents = () => useStore(events)
export const useProfile = () => useStore(profile)
export const useLearnState = () => useStore(learn)

export const saveProfile = (p) => profile.set({ ...p, at: Date.now() })
export const clearProfile = () => profile.set(null)
export const updateProfile = (patch) => profile.get() && profile.set({ ...profile.get(), ...patch })
export const resetProgress = () => {
  events.set([])
  learn.set({ saved: [], done: [], notes: {} })
  sessions.set([])
}

export function toggleSavedLesson(slug) {
  const cur = learn.get()
  learn.set({ ...cur, saved: cur.saved.includes(slug) ? cur.saved.filter((s) => s !== slug) : [...cur.saved, slug] })
}
export function markLinkDone(key, done = true) {
  const cur = learn.get()
  learn.set({ ...cur, done: done ? [...new Set([...cur.done, key])] : cur.done.filter((k) => k !== key) })
}
export function saveNote(slug, text) {
  const cur = learn.get()
  learn.set({ ...cur, notes: { ...cur.notes, [slug]: text } })
}

/** All scored evidence: what the learner did here, plus their skills quiz. */
export function useAllEvents() {
  const ev = useEvents()
  const { answers } = useQuiz()
  return [...eventsFromQuiz(quiz, answers, competencyData.skillMap), ...ev]
}

export function useCompetencies() {
  const all = useAllEvents()
  const states = allCompetencies(competencies, all)
  return { states, events: all, weak: states.filter(isWeak), levels }
}

/** The learner's path with progress, or null before they have a profile. */
export function usePath() {
  const p = useProfile()
  const ev = useEvents()
  const { answers } = useQuiz()
  const learnState = useLearnState()
  const { states } = useCompetencies()
  if (!p) return null
  const base = buildPath(
    paths[p.persona],
    p,
    { events: ev, quizComplete: quiz.questions.every((q) => q.skill in answers), doneLinks: learnState.done }
  )
  const bySlug = Object.fromEntries(lessons.map((l) => [l.slug, l]))
  const ordered = prioritise(base.steps, states.filter(isWeak).map((s) => s.slug), bySlug)
  return { ...base, steps: ordered, next: ordered.find((s) => !s.done && !s.skipped) || null, path: paths[p.persona], profile: p }
}

// Interview simulator sessions: kept so a learner can review how they did.
const MAX_SESSIONS = 30
const sessions = createStore('pp.interviews.v1', [], (x) => (Array.isArray(x) ? x.filter((s) => s && Array.isArray(s.items)).slice(-MAX_SESSIONS) : []))
export const useSessions = () => useStore(sessions)
export const saveSession = (s) => sessions.set([...sessions.get(), s].slice(-MAX_SESSIONS))
export const clearSessions = () => sessions.set([])
