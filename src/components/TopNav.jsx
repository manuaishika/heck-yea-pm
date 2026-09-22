import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './ui'

const LINKS = [
  ['/role', 'Role & Skills'],
  ['/browse', 'Questions'],
  ['/companies', 'Companies'],
  ['/careers', 'Careers & India'],
  ['/ai', 'AI for PMs'],
  ['/flashcards', 'Flashcards'],
  ['/resources', 'Resources'],
]

function SearchBox({ id, autoFocus, onDone }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  function submit(e) {
    e.preventDefault()
    navigate(q.trim() ? `/browse?q=${encodeURIComponent(q.trim())}` : '/browse')
    onDone?.()
  }
  return (
    <form onSubmit={submit} role="search" className="flex-1">
      <label htmlFor={id} className="sr-only">
        Search questions
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search questions…"
        className="w-full rounded-button border border-border bg-surface px-3 py-1.5 text-body placeholder:text-text-muted focus-visible:border-accent"
      />
    </form>
  )
}

/**
 * The one nav bar, on every route: sticky, white, a hairline border beneath
 * it. Logo left, links centred, search and account right. Collapses to a
 * logo + menu button on phones; the menu opens as a drawer.
 */
export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const drawerId = useId()
  const searchId = useId()
  const menuBtnRef = useRef(null)

  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0 text-section font-semibold text-text no-underline hover:no-underline">
            Heck Yea PM
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-5 lg:flex">
            {LINKS.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap no-underline hover:text-accent hover:no-underline ${
                    isActive ? 'font-semibold text-accent' : 'text-text-muted'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden items-center gap-2 sm:flex">
              {searchOpen ? (
                <div className="w-52">
                  <SearchBox id={searchId} autoFocus onDone={() => setSearchOpen(false)} />
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Search questions"
                  onClick={() => setSearchOpen(true)}
                  className="grid size-9 place-items-center rounded-button text-text-muted hover:text-accent"
                >
                  <Icon name="question" />
                </button>
              )}
            </div>
            <Link
              to="/login"
              aria-label="Account"
              className="grid size-9 shrink-0 place-items-center rounded-button text-text-muted no-underline hover:text-accent hover:no-underline"
            >
              <Icon name="user-circle" />
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              aria-expanded={drawerOpen}
              aria-controls={drawerId}
              onClick={() => setDrawerOpen((v) => !v)}
              className="btn btn-sm lg:hidden"
            >
              {drawerOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            id={drawerId}
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4"
          >
            <SearchBox id={`${searchId}-mobile`} onDone={() => setDrawerOpen(false)} />
            <nav aria-label="Main" className="flex flex-col">
              {LINKS.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center rounded-button px-2 no-underline hover:no-underline ${
                      isActive ? 'font-semibold text-accent' : 'text-text'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <Link
              to="/login"
              className="flex min-h-11 items-center gap-2 rounded-button px-2 text-text no-underline hover:no-underline"
            >
              <Icon name="user-circle" size={18} />
              Account
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}
