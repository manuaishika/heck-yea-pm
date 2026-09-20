import { useId, useState } from 'react'

/* ------------------------------------------------------------------ icons
 * A small stroke-icon set for the rounded-square tile on expandable rows.
 * 16px box, 1.6 stroke, currentColor. Which icon a skill or category gets is
 * presentation only and lives here, not in the data.
 */

const PATHS = {
  question: (
    <>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M6.2 6.3a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.3M8 11.6v.1" />
    </>
  ),
  code: <path d="M5 4 1.5 8 5 12M11 4l3.5 4L11 12M9.2 2.8 6.8 13.2" />,
  database: (
    <>
      <ellipse cx="8" cy="4" rx="5.5" ry="2" />
      <path d="M2.5 4v8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V4M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2" />
    </>
  ),
  monitor: (
    <>
      <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" />
      <path d="M5.5 14h5M8 11v3" />
    </>
  ),
  bolt: <path d="M9 1.5 3 9h4.5L7 14.5 13 7H8.5L9 1.5Z" />,
  split: <path d="M2 8h4l3-4.5h5M6 8l3 4.5h5M12.5 1.8l1.5 1.7-1.5 1.7M12.5 10.8l1.5 1.7-1.5 1.7" />,
  table: (
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M1.5 6.5h13M1.5 10h13M6 6.5v7" />
    </>
  ),
  flow: <path d="M2 4h5l2 4H14M2 12h5l2-4M11.5 5.5 14 8l-2.5 2.5" />,
  spark: <path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6 8 1.5Z" />,
  shield: <path d="M8 1.5 2.5 3.5v4c0 3.3 2.3 5.6 5.5 7 3.2-1.4 5.5-3.7 5.5-7v-4L8 1.5Z" />,
  users: (
    <>
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.5 13.5c.4-2.4 2.2-3.8 4.5-3.8s4.1 1.4 4.5 3.8M10.5 3.3a2.4 2.4 0 0 1 0 4.5M12 9.9c1.4.5 2.3 1.6 2.6 3.4" />
    </>
  ),
  list: <path d="M5.5 4h8.5M5.5 8h8.5M5.5 12h8.5M2 4h.1M2 8h.1M2 12h.1" />,
  chart: <path d="M2 13.5h12M4 11V7M8 11V3.5M12 11V6" />,
  pen: <path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5Z" />,
  chat: <path d="M2 3.5h12v7H8.5L5 13.5v-3H2v-7Z" />,
  briefcase: (
    <>
      <rect x="1.5" y="4.5" width="13" height="9" rx="1.5" />
      <path d="M5.5 4.5v-1.5h5v1.5M1.5 8.5h13" />
    </>
  ),
  target: (
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.5" />
    </>
  ),
  map: <path d="M1.5 3.5 5.5 2v10.5L1.5 14V3.5ZM5.5 2l5 1.5V14l-5-1.5M10.5 3.5l4-1.5v10.5l-4 1.5" />,
  card: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="M1.5 6.5h13" />
    </>
  ),
  dot: <circle cx="8" cy="8" r="2.5" />,
}

export function Icon({ name = 'dot', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.dot}
    </svg>
  )
}

const SKILL_ICONS = {
  apis: 'code',
  databases: 'database',
  'client-server': 'monitor',
  'latency-caching': 'bolt',
  'ab-tests': 'split',
  sql: 'table',
  'data-pipelines': 'flow',
  'ml-features': 'spark',
  nfrs: 'shield',
  'user-research': 'users',
  prioritisation: 'list',
  metrics: 'chart',
  writing: 'pen',
  stakeholders: 'chat',
  business: 'briefcase',
}
export const iconForSkill = (slug) => SKILL_ICONS[slug] || 'dot'

const CATEGORY_ICONS = {
  Behavioral: 'users',
  'Product Design': 'pen',
  Strategy: 'target',
  Analytics: 'chart',
  Technical: 'code',
  General: 'question',
}
export const iconForCategory = (category) => CATEGORY_ICONS[category] || 'question'

/* ------------------------------------------------------------------- tile */

/** Rounded-square tile that holds an icon (or a logo). */
export function Tile({ children }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-button border border-border bg-page text-accent">
      {children}
    </span>
  )
}

/* ----------------------------------------------------- expandable row
 * The one accordion. Skills, questions and companies all use it.
 * Collapsed: white surface, hairline border. Expanded: border turns accent.
 */
export function Row({
  icon = 'dot',
  tile = null, // custom tile content (e.g. a logo) instead of an icon name
  title,
  sub = null,
  open: openProp,
  onToggle,
  defaultOpen = false,
  action = null, // small control shown left of the toggle (e.g. save)
  children,
}) {
  const [inner, setInner] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const panelId = useId()
  const toggle = () => (controlled ? onToggle?.() : setInner((v) => !v))

  return (
    <article className={`rounded-card border bg-surface ${open ? 'border-accent' : 'border-border'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Tile>{tile ?? <Icon name={icon} />}</Tile>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-text">{title}</span>
            {sub && <span className="block text-text-muted">{sub}</span>}
          </span>
        </button>
        {action}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={toggle}
          className={`w-5 shrink-0 text-center text-section leading-none ${open ? 'text-accent' : 'text-text-muted'}`}
        >
          {open ? '−' : '+'}
        </button>
      </div>
      <div id={panelId} hidden={!open} className="border-t border-border">
        {children}
      </div>
    </article>
  )
}

/* ----------------------------------------------- detail panel + blocks
 * Labelled columns, thin rules between, stacks on mobile. Three columns on
 * desktop; a fourth or fifth section wraps onto a second row.
 */
export function Detail({ columns }) {
  const n = columns.length
  const cols = Math.min(n, 3)
  const colClass = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }[cols]
  return (
    <div className={`grid gap-px bg-border ${colClass}`}>
      {columns.map((c, i) => {
        const last = i === n - 1
        const span = last && n > 3 ? cols - ((n - 1) % cols) : 1
        return (
          <div
            key={c.label}
            className="bg-surface p-4"
            style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
          >
            <p className="label !text-accent">{c.label}</p>
            <div className="mt-2 text-text">{c.children}</div>
          </div>
        )
      })}
    </div>
  )
}

/** A labelled block: tiny accent label over short body text. */
export function Block({ label, children, rule = true }) {
  return (
    <div className={`p-4 ${rule ? 'border-t border-border' : ''}`}>
      <p className="label !text-accent">{label}</p>
      <div className="mt-1 text-text">{children}</div>
    </div>
  )
}

/** Short bullets used inside detail columns and blocks. */
export function Bullets({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((p, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-text-muted" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

/** A list row that links (chapters on the landing page): same look as Row. */
export function LinkRow({ icon, title, sub, children }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 hover:border-accent">
      <Tile>
        <Icon name={icon} />
      </Tile>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-text">{title}</span>
        {sub && <span className="block text-text-muted">{sub}</span>}
      </span>
      {children}
    </div>
  )
}
