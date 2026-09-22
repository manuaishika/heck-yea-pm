import { Link } from 'react-router-dom'
import { categories, categoryCounts, categorySlug } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'
import { CategoryTag, Icon } from '../components/ui'
import CompaniesMarquee from '../components/CompaniesMarquee'
import DemoVideo from '../components/DemoVideo'
import InterviewLoopTimeline from '../components/InterviewLoopTimeline'
import Faq from '../components/Faq'

const STEPS = [
  ['target', 'Learn the role', 'What a PM actually does, and the ground an interview covers.', '/role'],
  ['layers', 'Pick your method', 'STAR, CIRCLES, North Star — the framework for each kind of question.', '/methods'],
  ['question', 'Practice questions', '87 questions with a model answer and the mistake that sinks most.', '/browse'],
  ['card', 'Lock it in', 'Flashcards mark what you know and what still needs another pass.', '/flashcards'],
]

const LOOP_ROUNDS = [
  { name: 'Recruiter screen', tests: 'Fit for the role, your background, and why this company.' },
  { name: 'Product sense', tests: 'How you structure a design question — not the final idea.' },
  { name: 'Analytics', tests: 'Metrics, a root-cause walkthrough, or a guesstimate — structure over speed.' },
  { name: 'Behavioral', tests: 'Real stories, told with STAR — your actual role, not the team’s.' },
  { name: 'Hiring manager', tests: 'Depth, judgement under pushback, and the questions you ask back.' },
]

const FAQS = [
  { q: 'Do I need to code?', a: 'No. You reason about how software works well enough to talk to engineers — that’s the Technical skill track, not a coding test.' },
  { q: 'Do I need an MBA?', a: 'No. Most APM programs hire straight from a bachelor’s degree. An MBA matters more for a senior PM move later.' },
  { q: 'Can a non-CS student get in?', a: 'Yes. Product thinking and communication are what’s tested — see Skills for exactly what that means.' },
  { q: 'How long should I prepare?', a: 'Two to four weeks of focused practice covers the bank. Cramming the night before does not.' },
  { q: 'Is this really free?', a: 'Yes. No paywall, no account required. Sign in only if you want progress synced across devices.' },
]

export default function Landing() {
  useHead({
    title: null,
    description:
      'Free prep for your first PM interview. The role, the skills, a question bank, and company loops — built for students applying to APM programs.',
    path: '/',
  })
  const counts = categoryCounts()

  return (
    <Page wide>
      {/* hero */}
      <div className="grid items-center gap-8 py-8 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="label text-accent">Heck Yea PM</p>
          <h1 className="mt-2">Prep for your first PM interview.</h1>
          <p className="mt-2 text-text-muted">Free interview prep for PM intern and APM roles.</p>
          <Link to="/browse" className="btn btn-primary mt-5 no-underline hover:no-underline">
            Browse questions
          </Link>
        </div>
        <DemoVideo />
      </div>

      {/* how to study here */}
      <section className="mt-12">
        <h2 className="text-center label">How to study here</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([icon, title, desc, to], i) => (
            <Link
              key={to}
              to={to}
              className="card flex flex-col p-4 no-underline hover:border-accent hover:no-underline"
            >
              <span className="grid size-9 place-items-center rounded-button bg-accent-tint text-accent">
                <Icon name={icon} />
              </span>
              <span className="label mt-3">Step {i + 1}</span>
              <span className="mt-1 font-semibold text-text">{title}</span>
              <span className="mt-1 text-text-muted">{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* companies marquee */}
      <section className="mt-12 text-center">
        <h2 className="label">Companies</h2>
        <div className="mt-3">
          <CompaniesMarquee />
        </div>
      </section>

      {/* categories */}
      <section className="mt-12 text-center">
        <h2 className="label">Categories</h2>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <li key={c}>
              <CategoryTag category={c} count={counts[c]} to={`/browse?category=${categorySlug(c)}`} />
            </li>
          ))}
        </ul>
      </section>

      {/* how a PM interview loop works */}
      <section className="mt-12">
        <h2 className="text-center label">How a PM interview loop works</h2>
        <p className="mt-1 text-center text-text-muted">A typical loop, round by round. Every company varies this.</p>
        <div className="mt-4">
          <InterviewLoopTimeline rounds={LOOP_ROUNDS} />
        </div>
      </section>

      {/* faq */}
      <section className="mt-12 pb-4">
        <h2 className="text-center label">FAQ</h2>
        <div className="mx-auto mt-4 max-w-2xl">
          <Faq items={FAQS} />
        </div>
      </section>
    </Page>
  )
}
