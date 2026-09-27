import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui'
import { Page } from '../components/Page'
import HeroStickers from '../components/HeroStickers'
import CompaniesMarquee from '../components/CompaniesMarquee'
import HowItWorks from '../components/HowItWorks'
import InterviewLoopTimeline from '../components/InterviewLoopTimeline'
import Faq from '../components/Faq'
import { useHead } from '../lib/useHead'

const BLOCKS = [
  {
    letter: 'R',
    word: 'Role',
    color: 'bg-block-pink',
    lines: ['What a PM actually does, day to day.', 'Startup vs scaled vs large, compared.', 'What good looks like at each level.'],
    to: '/role',
  },
  {
    letter: 'S',
    word: 'Skills',
    color: 'bg-block-yellow',
    lines: ['The 8 skills every loop tests.', 'Where you stand, in 15 questions.', 'A track built for each one.'],
    to: '/skills',
  },
  {
    letter: 'Q',
    word: 'Questions',
    color: 'bg-block-red',
    lines: ['87 questions, from real reports.', 'A model answer for every one.', 'The mistake that sinks most.'],
    to: '/browse',
  },
  {
    letter: 'M',
    word: 'Methods',
    color: 'bg-block-blue',
    lines: ['STAR, CIRCLES, RICE and eight more.', 'Now a diagram, not a paragraph.', 'Tap through to see how it works.'],
    to: '/methods',
  },
  {
    letter: 'C',
    word: 'Companies',
    color: 'bg-block-grey',
    lines: ['35 companies, across ten sectors.', 'Real loops, where we have a source.', 'A careers link for the rest.'],
    to: '/companies',
  },
  {
    letter: 'C',
    word: 'Careers',
    color: 'bg-block-green',
    lines: ['APM, intern, associate PM, analyst.', 'Breaking in with no PM background.', "Who's hiring, filtered by sector."],
    to: '/careers',
  },
]

const CHECKLIST = ['Learn the role', 'Pick a method', 'Do ten questions', 'Run flashcards']

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

/** Checkboxes on the sticky note — purely a this-session convenience, not
 * synced or graded; nothing here is progress tracking. */
function StickyChecklist() {
  const [checked, setChecked] = useState(() => new Set())
  function toggle(i) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }
  return (
    <ul className="mt-4 space-y-2">
      {CHECKLIST.map((item, i) => (
        <li key={item}>
          <label className="flex min-h-8 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="size-4 shrink-0 accent-ink"
            />
            <span className={checked.has(i) ? 'text-text-muted line-through' : 'text-text'}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

/** Six full-bleed colour panels, edge to edge regardless of the page's own
 * max-width container. */
function SectionBlocks() {
  return (
    <section className="relative left-1/2 mt-16 w-screen -translate-x-1/2">
      <div className="grid sm:grid-cols-2 lg:grid-cols-6">
        {BLOCKS.map((b) => (
          <Link
            key={b.word}
            to={b.to}
            className={`group flex min-h-72 flex-col justify-between border-b border-border ${b.color} p-6 text-text no-underline hover:no-underline sm:border-r lg:min-h-96`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[3.5rem] leading-none">{b.letter}</span>
              <span className="font-display text-section uppercase">{b.word}</span>
            </div>
            <div>
              <span className="mb-3 block opacity-70">
                <Icon name="spark" size={22} />
              </span>
              <ul className="space-y-1">
                {b.lines.map((l) => (
                  <li key={l} className="text-body">
                    {l}
                  </li>
                ))}
              </ul>
              <span aria-hidden="true" className="mt-4 block text-section transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Landing() {
  useHead({
    title: null,
    description:
      'Free prep for your first PM interview. The role, the skills, a question bank, and company loops — built for students applying to APM programs.',
    path: '/',
  })

  return (
    <Page wide>
      {/* hero */}
      <div className="relative py-10 lg:py-16">
        <HeroStickers />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h1>
            Prep for your <em>first</em> PM interview.
          </h1>
          <p className="mt-3 text-text-muted">Learning, practising, landing it.</p>
          <Link to="/browse" className="btn btn-primary mt-6 px-7 py-3 no-underline hover:no-underline">
            Browse questions
          </Link>
        </div>
      </div>

      <SectionBlocks />

      {/* study checklist */}
      <section className="mt-16 grid items-start gap-8 lg:grid-cols-[20rem_1fr]">
        <div className="rotate-[-2deg] border border-border bg-tag p-5">
          <p className="label !text-current text-text">Before you start</p>
          <StickyChecklist />
        </div>
        <div>
          <h2>What this is</h2>
          <p className="prose-body mt-2">
            A free question bank and interview guide for your first product-manager role — PM intern
            or APM. Every question has a model answer and the mistake that sinks most candidates. No
            paywall, no account required.
          </p>
          <Link to="/about" className="btn mt-4 no-underline hover:no-underline">
            Read more
          </Link>
        </div>
      </section>

      {/* how to prep with it, as a short animated explainer */}
      <section className="mt-16">
        <h2 className="text-center">How to prep with it</h2>
        <div className="mx-auto mt-4 max-w-3xl">
          <HowItWorks />
        </div>
      </section>

      {/* how a PM interview loop works */}
      <section className="mt-16">
        <h2 className="text-center">How a PM interview loop works</h2>
        <p className="mt-1 text-center text-text-muted">A typical loop, round by round. Every company varies this.</p>
        <div className="mt-4">
          <InterviewLoopTimeline rounds={LOOP_ROUNDS} />
        </div>
      </section>

      {/* companies marquee */}
      <section className="mt-16 text-center">
        <h2 className="label">Companies</h2>
        <div className="mt-3">
          <CompaniesMarquee />
        </div>
      </section>

      {/* faq */}
      <section className="mt-16 pb-4">
        <h2 className="text-center">FAQ</h2>
        <div className="mx-auto mt-4 max-w-2xl">
          <Faq items={FAQS} />
        </div>
      </section>
    </Page>
  )
}
