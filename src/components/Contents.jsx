import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const chapters = [
  { n: '1', to: '/role', label: 'Role' },
  { n: '2', to: '/skills', label: 'Skills' },
  { n: '3', to: '/browse', label: 'Questions' },
  { n: '4', to: '/companies', label: 'Companies' },
]

const library = [
  { to: '/guesstimates', label: 'Guesstimates' },
  { to: '/resume', label: 'Resume' },
  { to: '/careers', label: 'Careers & paths' },
  { to: '/india', label: 'Getting in from India' },
  { to: '/resources', label: 'Resources' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/saved', label: 'Saved' },
]

function chapterClass({ isActive }) {
  return [
    'flex items-baseline gap-3 rounded-button px-3 py-2 no-underline',
    isActive
      ? 'bg-accent font-semibold text-surface hover:no-underline'
      : 'text-text hover:bg-page hover:no-underline',
  ].join(' ')
}

function libraryClass({ isActive }) {
  return [
    'block rounded-button px-3 py-1 no-underline hover:text-text hover:no-underline',
    isActive ? 'font-semibold text-text' : 'text-text-muted',
  ].join(' ')
}

/**
 * The sidebar. Identical on every route: product name, numbered chapters, a
 * LIBRARY group of plain links, and About pinned at the bottom.
 */
export default function Sidebar({ onNavigate }) {
  const { enabled, user } = useAuth()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-3">
        <Link to="/" onClick={onNavigate} className="text-section font-semibold text-text no-underline hover:no-underline">
          Heck Yea PM
        </Link>
        <span aria-hidden="true" className="mt-1 block h-0.5 w-6 bg-accent" />
        <p className="mt-2 text-text-muted">first PM loop, prepped</p>
      </div>

      <nav aria-label="Contents" className="mt-6 flex-1">
        <ul className="space-y-1">
          {chapters.map((c) => (
            <li key={c.to}>
              <NavLink to={c.to} className={chapterClass} onClick={onNavigate}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`w-3 tabular-nums ${isActive ? 'text-surface' : 'text-text-muted'}`}
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

        <p className="label mb-2 mt-6 px-3">Library</p>
        <ul>
          {library.map((t) => (
            <li key={t.to}>
              <NavLink to={t.to} className={libraryClass} onClick={onNavigate}>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-6 border-t border-border pt-3">
        {enabled && (
          <li>
            <NavLink to="/login" className={libraryClass} onClick={onNavigate}>
              {user ? 'Account' : 'Sign in'}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/about" className={libraryClass} onClick={onNavigate}>
            About
          </NavLink>
        </li>
      </ul>
    </div>
  )
}
