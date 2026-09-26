import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui'
import { Page } from '../components/Page'
import HeroStickers from '../components/HeroStickers'
import CompaniesMarquee from '../components/CompaniesMarquee'
import DemoVideo from '../components/DemoVideo'
import InterviewLoopTimeline from '../components/InterviewLoopTimeline'
import Faq from '../components/Faq'
import { useHead } from '../lib/useHead'

const FEATURED = [
  {
    tag: 'New',
    color: 'bg-block-yellow',
    icon: 'spark',
    title: 'AI for PMs',
    desc: 'How AI shows up in the loop now, and how to evaluate an AI feature on the spot.',
    date: 'Sep 2026',
    to: '/ai',
  },
  {
    tag: 'Hardest',
    color: 'bg-block-red',
    icon: 'chart',
    title: 'Metric-drop diagnosis',
    desc: 'Orders fell 30% overnight. The method for finding out why, live, without guessing.',
    date: 'Sep 2026',
    to: '/methods/metric-drop',
  },
  {
    tag: 'Loop',
    color: 'bg-block-blue',
    icon: 'briefcase',
    title: 'Google APM',
    desc: 'Case-heavy, five rounds, judged on structure over the final idea, not the answer.',
    date: 'Sep 2026',
    to: '/companies/google',
  },
]

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

/** The featured row's horizontal scroller — three cards, prev/next arrows
 * scroll by one card width; snaps so a card never sits half-visible. */
function FeaturedRow() {
  const scroller = useRef(null)
  function by(dir) {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="label">Featured</p>
          <Link to="/directory" className="btn btn-sm no-underline hover:no-underline">
            View all
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => by(-1)}
            className="grid size-9 place-items-center rounded-pill border border-border text-text hover:border-accent"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => by(1)}
            className="grid size-9 place-items-center rounded-pill border border-border text-text hover:border-accent"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scroller} className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2">
        {FEATURED.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="card flex w-72 shrink-0 snap-start flex-col p-0 no-underline hover:border-accent hover:no-underline"
          >
            <div className="flex h-28 items-center justify-center border-b border-border bg-card">
              <Icon name={f.icon} size={28} />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className={`pill pill-static self-start !text-ink ${f.color}`}>{f.tag}</span>
              <p className="mt-2 font-semibold text-text">{f.title}</p>
              <p className="mt-1 flex-1 text-text-muted">{f.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="label">{f.date}</span>
                <span aria-hidden="true" className="text-text">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
          <span className="pill pill-static">Heck Yea PM</span>
          <h1 className="mt-4">
            Prep for your <em>first</em> PM interview.
          </h1>
          <p className="hand mt-3 text-[1.5rem]">+ learning, practising, landing it</p>
          <Link to="/browse" className="btn btn-primary mt-6 no-underline hover:no-underline">
            Browse questions
          </Link>
        </div>
      </div>

      <FeaturedRow />
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

      {/* the demo video */}
      <section className="mt-16">
        <h2 className="text-center">See it in ten seconds</h2>
        <div className="mx-auto mt-4 max-w-xl">
          <DemoVideo />
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
