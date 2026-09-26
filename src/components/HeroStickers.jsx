/**
 * Flat, black-outlined stickers scattered across the hero: two Pip
 * expressions plus a handful of everyday study objects. Drawn from scratch
 * as plain stroked SVG shapes — nothing traced or copied. Each drifts very
 * slightly on a loop (off under reduced motion) and tilts further on hover.
 */

const STROKE = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

function PipHappy() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle cx="32" cy="32" r="24" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M22 28c0 2 1.5 2 1.5 0s-1.5-2-1.5 0" {...STROKE} />
      <path d="M40.5 28c0 2 1.5 2 1.5 0s-1.5-2-1.5 0" {...STROKE} />
      <path d="M22 38c3 4 17 4 20 0" {...STROKE} />
      <path d="M18 20c1-2 4-3 6-2" {...STROKE} />
      <path d="M46 20c-1-2-4-3-6-2" {...STROKE} />
    </svg>
  )
}

function PipThinking() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle cx="32" cy="32" r="24" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="23" cy="29" r="1.6" fill="var(--ink)" />
      <circle cx="41" cy="29" r="1.6" fill="var(--ink)" />
      <path d="M25 39h13" {...STROKE} />
      <path d="M14 16c3-3 6-4 9-3" {...STROKE} />
      <path d="M46 24c3 1 4 4 2 7" {...STROKE} />
      <circle cx="49" cy="14" r="1.4" fill="var(--ink)" />
      <circle cx="53" cy="9" r="2" fill="var(--ink)" />
    </svg>
  )
}

function Laptop() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect x="14" y="14" width="36" height="24" rx="2" fill="var(--card)" {...STROKE} />
      <path d="M18 18h28v16H18z" {...STROKE} />
      <path d="M8 42h48l-4 8H12z" fill="var(--card)" {...STROKE} />
      <path d="M27 26h10" {...STROKE} />
    </svg>
  )
}

function StickyNote() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path d="M12 12h32l8 8v32H12z" fill="var(--tag)" {...STROKE} />
      <path d="M44 12v8h8" {...STROKE} />
      <path d="M18 28h20M18 36h20M18 44h12" {...STROKE} />
    </svg>
  )
}

function BarChart() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path d="M10 52h44" {...STROKE} />
      <rect x="16" y="34" width="9" height="18" fill="var(--block-blue)" {...STROKE} />
      <rect x="28" y="22" width="9" height="30" fill="var(--tag)" {...STROKE} />
      <rect x="40" y="14" width="9" height="38" fill="var(--block-pink)" {...STROKE} />
    </svg>
  )
}

function Lightbulb() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path
        d="M32 10a16 16 0 0 1 10 28c-2 2-3 4-3 7h-14c0-3-1-5-3-7a16 16 0 0 1 10-28Z"
        fill="var(--tag)"
        {...STROKE}
      />
      <path d="M25 51h14M27 57h10" {...STROKE} />
      <path d="M32 18v14M27 25l10 0" {...STROKE} />
    </svg>
  )
}

function Calendar() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect x="10" y="14" width="44" height="38" rx="2" fill="var(--card)" {...STROKE} />
      <path d="M10 24h44" {...STROKE} />
      <path d="M20 10v8M44 10v8" {...STROKE} />
      <rect x="18" y="30" width="7" height="7" fill="var(--block-red)" {...STROKE} />
      <rect x="29" y="30" width="7" height="7" fill="none" {...STROKE} />
      <rect x="40" y="30" width="7" height="7" fill="none" {...STROKE} />
    </svg>
  )
}

const STICKERS = [
  { Icon: PipHappy, top: '2%', left: '6%', size: 76, rot: -8, delay: 0 },
  { Icon: Lightbulb, top: '4%', left: '62%', size: 58, rot: 10, delay: 0.6 },
  { Icon: PipThinking, top: '38%', left: '78%', size: 84, rot: 6, delay: 1.2 },
  { Icon: BarChart, top: '62%', left: '4%', size: 62, rot: -6, delay: 0.3 },
  { Icon: StickyNote, top: '68%', left: '58%', size: 58, rot: 8, delay: 0.9 },
  { Icon: Calendar, top: '2%', left: '32%', size: 54, rot: -5, delay: 1.5 },
  { Icon: Laptop, top: '70%', left: '30%', size: 64, rot: 4, delay: 0.4 },
]

/** Absolute-positioned within a `relative` ancestor at least as tall as the
 * hero copy; hidden below lg, where there isn't room for them not to
 * collide with the headline. */
export default function HeroStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden="true">
      {STICKERS.map(({ Icon, top, left, size, rot, delay }, i) => (
        <div
          key={i}
          className="sticker-drift pointer-events-auto absolute"
          style={{ top, left, width: size, height: size, '--rot': `${rot}deg`, animationDelay: `${delay}s` }}
        >
          <Icon />
        </div>
      ))}
    </div>
  )
}
