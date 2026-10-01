import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import PageContainer from './PageContainer'

const REPO = 'https://github.com/manuaishika/heck-yea-pm'

const COLUMNS = [
  {
    label: 'Learn',
    links: [
      ['/role', 'Role & skills'],
      ['/skills', 'Skills'],
      ['/methods', 'Methods'],
      ['/ai', 'AI for PMs'],
    ],
  },
  {
    label: 'Practise',
    links: [
      ['/browse', 'Question bank'],
      ['/flashcards', 'Flashcards'],
      ['/guesstimates', 'Guesstimates'],
      ['/skills/assess', 'Skills quiz'],
    ],
  },
  {
    label: 'Get hired',
    links: [
      ['/companies', 'Companies'],
      ['/careers', 'Careers'],
      ['/resume', 'Resume'],
      ['/resources', 'Resources'],
    ],
  },
]

const STAMP_TEXT = 'FREE · NO PAYWALL · BUILT IN INDIA · '

/** The circular rotating stamp: mono type set on a circle, spinning slowly.
 * Static under reduced motion. Sits where a logo would. */
function StampBadge() {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 160 160" className="size-20 shrink-0" role="img" aria-label="Free. No paywall. Built in India.">
      <g className={reduce ? '' : 'stamp-spin'} style={{ transformOrigin: '80px 80px' }}>
        <path id="stamp-circle" fill="none" d="M 80,80 m -58,0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0" />
        <text fontFamily="var(--font-mono)" fontSize="10.5" fontWeight="700" letterSpacing="1.5" fill="var(--royal)">
          <textPath href="#stamp-circle" startOffset="0%" textLength="362" lengthAdjust="spacing">
            {STAMP_TEXT}
          </textPath>
        </text>
      </g>
      <circle cx="80" cy="80" r="30" fill="var(--royal)" />
      <text x="80" y="86" textAnchor="middle" fontFamily="var(--font-display)" fontSize="17" fill="var(--butter)">
        PP
      </text>
    </svg>
  )
}

/** Line-art Pip waving from the corner — the same hand as the hero stickers. */
function WavingPip() {
  const line = { fill: 'none', stroke: 'var(--royal)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 90 80" className="h-12 w-auto shrink-0" aria-hidden="true">
      <circle cx="40" cy="44" r="26" fill="var(--card)" stroke="var(--royal)" strokeWidth="2.2" />
      <circle cx="31" cy="41" r="2" fill="var(--royal)" />
      <circle cx="49" cy="41" r="2" fill="var(--royal)" />
      <path d="M30 52c4 5 16 5 20 0" {...line} />
      <path d="M66 36c5-6 9-12 10-20" {...line} />
      <path d="M72 14l4 2 3-4M79 18l4-1" {...line} />
    </svg>
  )
}

/** A wavy hairline, drawn as one repeating SVG pattern so it spans any width. */
function WavyRule() {
  return (
    <svg className="block h-3 w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id="footer-wave" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q 6 0 12 6 T 24 6" fill="none" stroke="var(--royal)" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#footer-wave)" />
    </svg>
  )
}

/** Email sign-in, the footer's one form. Only syncs progress; email is
 * opt-in and only ever carries the sign-in link. Falls back to a link to
 * /login when auth isn't configured. */
function SyncBox() {
  const { enabled, user, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error

  const field = 'flex min-h-12 w-full items-center border border-royal bg-transparent text-royal'

  if (user) {
    return (
      <Link to="/login" className={`${field} justify-between px-4 no-underline hover:no-underline`}>
        <span>Syncing as {user.email}</span>
        <span aria-hidden="true">→</span>
      </Link>
    )
  }

  if (!enabled) {
    return (
      <Link to="/login" className={`${field} justify-between px-4 no-underline hover:no-underline`}>
        <span>Log in</span>
        <span aria-hidden="true">→</span>
      </Link>
    )
  }

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setState('sending')
    const { error } = await signInWithEmail(email.trim())
    setState(error ? 'error' : 'sent')
  }

  if (state === 'sent') {
    return <p className={`${field} px-4`}>Check your inbox for the sign-in link.</p>
  }

  return (
    <form onSubmit={submit} className={field}>
      <label htmlFor="footer-email" className="sr-only">
        Email
      </label>
      <input
        id="footer-email"
        type="email"
        required
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-royal placeholder:text-royal/70 focus-visible:outline-none"
      />
      <button type="submit" disabled={state === 'sending'} aria-label="Send sign-in link" className="grid size-12 shrink-0 place-items-center">
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M0 7h20M14 1l6 6-6 6" />
        </svg>
      </button>
      {state === 'error' && (
        <span role="alert" className="sr-only">
          That didn&rsquo;t send. Try again.
        </span>
      )}
    </form>
  )
}

/**
 * Full-bleed footer, built on a grocer's "thank you for your curiosity"
 * sign-off: butter paper with one serif line in royal blue (kept smaller
 * than the homepage headline), link columns, the sign-in box, a wavy rule
 * and a strip of small print.
 */
export default function Footer() {
  return (
    <footer className="text-royal">
      <div className="border-t border-royal bg-butter">
        <PageContainer className="pt-8 sm:pt-10">
          {/* deliberately smaller than the homepage headline (h1) */}
          <p className="text-center font-sans text-[1.75rem] font-normal leading-[1.05] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.75rem]">
            Come back when the nerves kick in.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-[auto_1fr_1fr_1fr_1fr_1.6fr]">
            <div className="col-span-2 flex justify-center sm:col-span-3 lg:col-span-1 lg:block">
              <StampBadge />
            </div>

            {COLUMNS.map((col) => (
              <nav key={col.label} aria-label={col.label}>
                <p className="font-semibold uppercase tracking-wide">{col.label}</p>
                <ul className="mt-2 space-y-1">
                  {col.links.map(([to, label]) => (
                    <li key={to}>
                      <Link to={to} className="text-royal no-underline hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <p className="font-semibold uppercase tracking-wide">Talk to us</p>
              <p className="mt-2">Wrong answer? Missing company?</p>
              <a href={`${REPO}/issues`} target="_blank" rel="noreferrer noopener" className="text-royal underline underline-offset-2">
                Open an issue
              </a>
            </div>

            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <p>Sign in to sync saved questions and flashcards across devices. We only email the sign-in link.</p>
              <div className="mt-3">
                <SyncBox />
              </div>
            </div>
          </div>
        </PageContainer>

        <div className="mt-8 flex items-end gap-4 pl-4 pr-4 sm:pl-6 sm:pr-6">
          <div className="min-w-0 flex-1">
            <WavyRule />
          </div>
          <WavingPip />
        </div>

        <PageContainer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-label font-semibold uppercase tracking-wide">
            <li>
              <Link to="/about" className="text-royal no-underline hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/saved" className="text-royal no-underline hover:underline">
                Saved
              </Link>
            </li>
          </ul>
          <a href={REPO} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="text-royal">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <p className="font-mono text-label font-semibold uppercase tracking-wide">Learning, practising, landing it.</p>
        </PageContainer>
      </div>
    </footer>
  )
}
