import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAutoStep, useInView } from '../lib/useInView'
import ProgressFill from './ProgressFill'

/**
 * The homepage explainer: a short "video" built from the site's own parts,
 * not a screen recording. Five scenes play in a loop once it's on screen,
 * each with a progress segment (tap one to jump) and a pause control.
 * Under reduced motion it's a plain numbered list of the same five steps.
 */

const SCENE_MS = 4200

const card = 'border border-ink bg-card text-ink'

function LearnScene() {
  const loop = ['Learn', 'Decide', 'Spec', 'Ship', 'Align']
  return (
    <div className="w-full max-w-xs">
      <motion.p
        className={`${card} px-4 py-2 text-center font-semibold`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        What to build, and why
      </motion.p>
      <ol className="mt-3 grid grid-cols-5 gap-1.5">
        {loop.map((s, i) => (
          <motion.li
            key={s}
            className={`${card} py-2 text-center text-label font-semibold`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, backgroundColor: ['var(--card)', 'var(--ink)', 'var(--card)'], color: ['var(--ink)', 'var(--card)', 'var(--ink)'] }}
            transition={{ delay: 0.4 + i * 0.35, duration: 0.7 }}
          >
            {s}
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

function GapsScene() {
  const bars = [
    ['Product sense', 0.8],
    ['Metrics', 0.3],
    ['Prioritisation', 0.65],
    ['Technical', 0.5],
  ]
  return (
    <div className={`${card} w-full max-w-xs p-4`}>
      <p className="label !text-ink">Quiz · 15 of 15</p>
      <ul className="mt-3 space-y-2.5">
        {bars.map(([name, v], i) => (
          <li key={name}>
            <div className="flex justify-between text-label font-semibold">
              <span>{name}</span>
              {v < 0.4 && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
                  your gap
                </motion.span>
              )}
            </div>
            <div className="mt-1 h-2.5 bg-paper">
              <motion.div
                className={v < 0.4 ? 'h-full bg-block-red' : 'h-full bg-ink'}
                initial={{ width: 0 }}
                animate={{ width: `${v * 100}%` }}
                transition={{ delay: 0.3 + i * 0.25, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MethodScene() {
  const star = ['S', 'T', 'A', 'R']
  return (
    <div className="w-full max-w-xs">
      <motion.p
        className={`${card} px-4 py-3 font-semibold`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Describe a time you missed a deadline.
      </motion.p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {star.map((l, i) => (
          <motion.span
            key={l}
            className={`${card} grid aspect-square place-items-center font-display text-section`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, backgroundColor: ['var(--card)', 'var(--ink)'], color: ['var(--ink)', 'var(--card)'] }}
            transition={{ delay: 0.6 + i * 0.5, duration: 0.4 }}
          >
            {l}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function FlashcardScene() {
  return (
    <div className="w-full max-w-xs" style={{ perspective: 800 }}>
      <motion.div
        className="relative h-40"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ delay: 1.4, duration: 0.6, ease: 'easeInOut' }}
      >
        <div className={`${card} absolute inset-0 flex flex-col justify-between p-4`} style={{ backfaceVisibility: 'hidden' }}>
          <p className="label !text-ink">Card 3 of 10</p>
          <p className="font-semibold">Orders fell 30% overnight. First question?</p>
        </div>
        <div
          className={`${card} absolute inset-0 flex flex-col justify-between p-4`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="label !text-ink">Answer</p>
          <p>Is it real? Check tracking, then internal changes, then outside events.</p>
        </div>
      </motion.div>
    </div>
  )
}

function ReadyScene() {
  const rounds = ['Screen', 'Product', 'Analytics', 'Behavioral', 'Manager']
  return (
    <ol className="grid w-full max-w-xs grid-cols-5 gap-1">
      {rounds.map((r, i) => (
        <li key={r} className="flex flex-col items-center gap-2 text-center">
          <motion.span
            className="grid size-10 place-items-center rounded-pill border border-ink font-semibold"
            initial={{ backgroundColor: 'var(--card)', color: 'var(--ink)' }}
            animate={{ backgroundColor: 'var(--ink)', color: 'var(--card)' }}
            transition={{ delay: 0.4 + i * 0.45, duration: 0.3 }}
          >
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.45 }}>
              ✓
            </motion.span>
          </motion.span>
          <span className="text-label font-semibold leading-tight">{r}</span>
        </li>
      ))}
    </ol>
  )
}

const SCENES = [
  { title: 'Learn the role', line: 'What a PM decides, and the loop they run.', to: '/role', bg: 'bg-block-pink', Art: LearnScene },
  { title: 'Find your gaps', line: 'Fifteen questions show your weakest skill.', to: '/skills/assess', bg: 'bg-block-yellow', Art: GapsScene },
  { title: 'Answer with a method', line: 'STAR, CIRCLES, RICE: a shape for every question.', to: '/methods', bg: 'bg-block-blue', Art: MethodScene },
  { title: 'Drill the flashcards', line: 'Ten a day, until the answers come without notes.', to: '/flashcards', bg: 'bg-block-green', Art: FlashcardScene },
  { title: 'Walk in ready', line: 'Know every round of the loop before it starts.', to: '/companies', bg: 'bg-block-grey', Art: ReadyScene },
]

const num = (i) => String(i + 1).padStart(2, '0')

export default function HowItWorks() {
  const reduce = useReducedMotion()
  const [ref, inView] = useInView(0.4)
  const [playing, setPlaying] = useState(true)
  const running = inView && playing && !reduce
  const [i, jump, run] = useAutoStep(SCENES.length, SCENE_MS, running)

  if (reduce) {
    return (
      <ol className="card divide-y divide-border">
        {SCENES.map((s, k) => (
          <li key={s.title}>
            <Link to={s.to} className="flex items-baseline gap-4 p-4 text-text no-underline hover:no-underline">
              <span className="label">{num(k)}</span>
              <span>
                <span className="block font-semibold">{s.title}</span>
                <span className="block text-text-muted">{s.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    )
  }

  const scene = SCENES[i]
  const { Art } = scene

  return (
    <div ref={ref} className="overflow-hidden border border-ink bg-card">
      <div className={`relative h-[28rem] sm:h-auto sm:aspect-[16/9] ${scene.bg} transition-colors duration-500`}>
        {/* progress segments, story-style */}
        <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 p-3">
          {SCENES.map((s, k) => (
            <button
              key={s.title}
              type="button"
              onClick={() => jump(k)}
              aria-label={`Step ${k + 1}: ${s.title}`}
              aria-current={k === i ? 'step' : undefined}
              className="flex h-5 flex-1 items-center"
            >
              <span className="block h-1 w-full bg-card/60">
                {k < i && <span className="block h-full bg-ink" />}
                {k === i && <ProgressFill run={run} ms={SCENE_MS} playing={running} />}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="absolute inset-0 flex flex-col justify-between gap-6 p-5 pt-12 sm:flex-row sm:items-center sm:p-10 sm:pt-14"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-ink sm:max-w-[45%]">
              <p className="font-display text-[3.25rem] leading-none sm:text-[6rem]">{num(i)}</p>
              <p className="mt-2 text-section font-semibold leading-tight">{scene.title}</p>
              <p className="mt-2">{scene.line}</p>
            </div>
            <div className="flex flex-1 justify-center sm:justify-end">
              <Art />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink px-4 py-2">
        <span className="label !text-ink">
          {num(i)} / {num(SCENES.length - 1)}
        </span>
        <Link to={scene.to} className="btn btn-sm ml-auto border-ink no-underline hover:no-underline">
          {scene.title} →
        </Link>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid size-11 place-items-center rounded-pill border border-ink text-ink"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="4" height="12" fill="currentColor" />
              <rect x="9" y="2" width="4" height="12" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 2l11 6-11 6V2Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
