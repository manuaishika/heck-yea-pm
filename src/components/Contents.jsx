import { NavLink } from 'react-router-dom'

const chapters = [
  { n: '1', to: '/role', label: 'The role' },
  { n: '2', to: '/skills', label: 'Skills' },
  { n: '3', to: '/browse', label: 'Question bank' },
  { n: '4', to: '/companies', label: 'Companies' },
]

const prepare = [
  { to: '/guesstimates', label: 'Guesstimates' },
  { to: '/resume', label: 'Resume' },
  { to: '/careers', label: 'Careers & paths' },
  { to: '/india', label: 'Getting in from India' },
  { to: '/resources', label: 'Resources' },
]

const tools = [
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/saved', label: 'Saved' },
]

function chapterClass({ isActive }) {
  return [
    'flex items-baseline gap-2.5 py-1.5 text-sm no-underline transition-colors',
    isActive ? 'text-ink' : 'text-ink-dim hover:text-ink',
  ].join(' ')
}

function itemClass({ isActive }) {
  return [
    'block py-1.5 text-sm no-underline transition-colors',
    isActive ? 'text-ink' : 'text-ink-dim hover:text-ink',
  ].join(' ')
}

function Group({ heading, items, onNavigate }) {
  return (
    <>
      <p className="label mb-1 mt-5">{heading}</p>
      <ul>
        {items.map((t) => (
          <li key={t.to}>
            <NavLink to={t.to} className={itemClass} onClick={onNavigate}>
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  )
}

/** The site's table of contents. Rendered in the desktop rail and the mobile sheet. */
export default function Contents({ onNavigate }) {
  return (
    <nav aria-label="Contents" className="text-sm">
      <ul>
        {chapters.map((c) => (
          <li key={c.to}>
            <NavLink to={c.to} className={chapterClass} onClick={onNavigate}>
              {({ isActive }) => (
                <>
                  <span
                    className={`label ${isActive ? 'text-accent' : ''}`}
                    aria-hidden="true"
                  >
                    {c.n}
                  </span>
                  <span>{c.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <Group heading="Prepare" items={prepare} onNavigate={onNavigate} />
      <Group heading="Study" items={tools} onNavigate={onNavigate} />

      <ul className="mt-5 border-t border-rule pt-3">
        <li>
          <NavLink to="/about" className={itemClass} onClick={onNavigate}>
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
