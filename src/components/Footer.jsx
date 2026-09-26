import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'

const LINKS = [
  ['/role', 'Role & Skills'],
  ['/browse', 'Questions'],
  ['/methods', 'Methods'],
  ['/companies', 'Companies'],
  ['/careers', 'Careers'],
  ['/resources', 'Resources'],
  ['/directory', 'Index'],
  ['/about', 'About'],
]

const STAMP_TEXT = 'FREE · NO PAYWALL · BUILT IN INDIA · '

/** The circular rotating stamp badge: one line of mono type set on a circle,
 * spinning slowly. Static under reduced motion. */
function StampBadge() {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 160 160" className="size-28 shrink-0" role="img" aria-label="Free. No paywall. Built in India.">
      <g className={reduce ? '' : 'stamp-spin'} style={{ transformOrigin: '80px 80px' }}>
        <path id="stamp-circle" fill="none" d="M 80,80 m -58,0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0" />
        <text fontFamily="var(--font-mono)" fontSize="10.5" fontWeight="700" letterSpacing="1.5" fill="var(--ink)">
          <textPath href="#stamp-circle" startOffset="0%">
            {STAMP_TEXT.repeat(2)}
          </textPath>
        </text>
      </g>
      <circle cx="80" cy="80" r="30" fill="var(--ink)" />
      <text x="80" y="76" textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill="var(--tag)">
        HYPM
      </text>
      <text x="80" y="90" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fontWeight="600" fill="var(--card)">
        EST. NOW
      </text>
    </svg>
  )
}

/**
 * Full-bleed footer: a handwritten reminder, the rotating stamp badge on its
 * own yellow cell, a links cell and a socials cell, then a mono micro-type
 * strip. Runs edge to edge, not inside PageContainer's 1280px measure.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="grid divide-y divide-border sm:grid-cols-[1.3fr_auto_1fr_1fr] sm:divide-x sm:divide-y-0">
        <div className="flex items-center px-6 py-8">
          <p className="hand text-[1.75rem] leading-tight">
            Come back when the nerves kick in — that&rsquo;s what this is for.
          </p>
        </div>

        <div className="flex items-center justify-center bg-tag px-8 py-6">
          <StampBadge />
        </div>

        <div className="px-6 py-8">
          <p className="label">Links</p>
          <ul className="mt-3 space-y-2">
            {LINKS.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-text no-underline hover:text-accent hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-8">
          <p className="label">Socials</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href="https://github.com/manuaishika/heck-yea-pm"
                target="_blank"
                rel="noreferrer noopener"
                className="text-text no-underline hover:text-accent hover:underline"
              >
                GitHub ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-6 py-3">
        <p className="label text-center !text-text-muted">Learning, practising, landing it.</p>
      </div>
    </footer>
  )
}
