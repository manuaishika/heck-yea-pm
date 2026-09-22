import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './ui'
import PageContainer from './PageContainer'
import { useAuth } from '../lib/auth'
import { globalSearch, SCOPES } from '../lib/globalSearch'

const NAV_GROUPS = [
  {
    label: 'Learn',
    items: [
      ['/role', 'Role & Skills'],
      ['/skills#technical', 'Technical'],
      ['/ai', 'AI for PMs'],
      ['/methods', 'Methods'],
    ],
  },
  {
    label: 'Practice',
    items: [
      ['/browse', 'Questions'],
      ['/flashcards', 'Flashcards'],
    ],
  },
]
const PLAIN_LINKS = [
  ['/companies', 'Companies'],
  ['/careers', 'Careers & India'],
  ['/resources', 'Resources'],
]
const ACTIVE_PREFIXES = {
  Learn: ['/role', '/skills', '/ai', '/methods'],
  Practice: ['/browse', '/flashcards'],
}

const TYPE_ICON = { Question: 'question', Method: 'target', Company: 'briefcase', Topic: 'spark' }

/** The pill search bar: scope dropdown, live results, Enter/click goes to the top match. */
function SearchBar({ id, className = '', onNavigate }) {
  const [q, setQ] = useState('')
  const [scope, setScope] = useState('All')
  const [scopeOpen, setScopeOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const boxRef = useRef(null)

  const results = q.trim() ? globalSearch(q, scope) : []
  const open = focused && q.trim().length > 0

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setFocused(false)
        setScopeOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function go(to) {
    navigate(to)
    setQ('')
    setFocused(false)
    onNavigate?.()
  }

  function submit(e) {
    e.preventDefault()
    if (results[0]) go(results[0].to)
    else if (q.trim()) go(`/browse?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit} className="flex items-stretch overflow-hidden rounded-pill border border-border bg-accent-tint">
        <label htmlFor={id} className="sr-only">
          Search questions, methods, companies and topics
        </label>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setScopeOpen((v) => !v)}
            aria-expanded={scopeOpen}
            aria-haspopup="listbox"
            className="flex h-full items-center gap-1 border-r border-border px-3 text-body text-text-muted hover:text-text"
          >
            {scope}
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="shrink-0">
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {scopeOpen && (
            <ul role="listbox" className="card absolute left-0 top-full z-30 mt-1 min-w-[9rem] overflow-hidden py-1">
              {SCOPES.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={scope === s}
                    onClick={() => {
                      setScope(s)
                      setScopeOpen(false)
                    }}
                    className={`flex min-h-11 w-full items-center px-3 text-left hover:bg-accent-tint ${
                      scope === s ? 'font-semibold text-accent' : 'text-text'
                    }`}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search questions, methods, companies…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-body placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="m-1 grid size-9 shrink-0 place-items-center rounded-pill bg-accent text-surface"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {open && (
        <div className="card absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto py-1">
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.type + r.to}
                type="button"
                onClick={() => go(r.to)}
                className="flex min-h-11 w-full items-center gap-3 px-3 text-left hover:bg-accent-tint"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-button bg-accent-tint text-accent">
                  <Icon name={TYPE_ICON[r.type] || 'question'} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-text">{r.label}</span>
                  <span className="label">{r.type} · {r.sub}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-text-muted">No matches in {scope.toLowerCase()}.</p>
          )}
        </div>
      )}
    </div>
  )
}

/** A "Learn"/"Practice" dropdown: opens on hover (desktop) or click, keyboard accessible. */
function NavDropdown({ label, items, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const closeTimer = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function openNow() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 whitespace-nowrap no-underline hover:text-accent hover:no-underline ${
          active ? 'font-semibold text-accent' : 'text-text-muted'
        }`}
      >
        {label}
        <svg width="9" height="6" viewBox="0 0 10 6" aria-hidden="true" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="card absolute left-0 top-full z-30 mt-2 min-w-[11rem] overflow-hidden py-1">
          {items.map(([to, label2]) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center px-3 text-text no-underline hover:bg-accent-tint hover:no-underline"
            >
              {label2}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function initials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '?'
  return name.trim().charAt(0).toUpperCase()
}

/** Avatar + menu (Account, Sign out) once signed in. */
function AccountMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  const photo = user?.user_metadata?.avatar_url

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-pill border border-border bg-accent-tint text-body font-semibold text-accent"
      >
        {photo ? <img src={photo} alt="" className="size-full object-cover" /> : initials(user)}
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-full z-30 mt-2 min-w-[10rem] overflow-hidden py-1">
          <Link
            to="/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center px-3 text-text no-underline hover:bg-accent-tint hover:no-underline"
          >
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="flex min-h-11 w-full items-center px-3 text-left text-text hover:bg-accent-tint"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * The one nav bar, on every route: sticky, white, a hairline border beneath
 * it, inside the same PageContainer as the page content below it. Logo,
 * search pill, dropdown nav groups, sign in. Collapses to a logo + menu
 * button on phones; the menu opens as a drawer.
 */
export default function TopNav() {
  const { enabled, user, signInWithGoogle } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const drawerId = useId()
  const searchId = useId()
  const menuBtnRef = useRef(null)

  useEffect(() => {
    setDrawerOpen(false)
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

  async function openSignIn() {
    if (!enabled) {
      navigate('/login')
      return
    }
    await signInWithGoogle()
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <PageContainer>
          <div className="flex items-center gap-4 py-3">
            <Link to="/" className="inline-flex min-h-11 shrink-0 items-center text-section font-semibold text-text no-underline hover:no-underline">
              Heck Yea PM
            </Link>

            <SearchBar id={searchId} className="hidden max-w-md flex-1 xl:block" />

            <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
              {NAV_GROUPS.map((g) => (
                <NavDropdown
                  key={g.label}
                  label={g.label}
                  items={g.items}
                  active={ACTIVE_PREFIXES[g.label].some((p) => location.pathname.startsWith(p))}
                />
              ))}
              {PLAIN_LINKS.map(([to, label]) => (
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

            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <div className="hidden xl:block">
                  <AccountMenu />
                </div>
              ) : (
                <div className="hidden items-center gap-3 xl:flex">
                  <button type="button" onClick={openSignIn} className="text-text-muted hover:text-accent">
                    Sign up
                  </button>
                  <button type="button" onClick={openSignIn} className="btn btn-primary rounded-pill">
                    Log in
                  </button>
                </div>
              )}
              <button
                ref={menuBtnRef}
                type="button"
                aria-expanded={drawerOpen}
                aria-controls={drawerId}
                onClick={() => setDrawerOpen((v) => !v)}
                className="btn btn-sm xl:hidden"
              >
                {drawerOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
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
            <SearchBar id={`${searchId}-mobile`} onNavigate={() => setDrawerOpen(false)} />
            <nav aria-label="Main" className="flex flex-col">
              {NAV_GROUPS.flatMap((g) => g.items).concat(PLAIN_LINKS).map(([to, label]) => (
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
            {user ? (
              <>
                <Link
                  to="/login"
                  className="flex min-h-11 items-center gap-2 rounded-button px-2 text-text no-underline hover:no-underline"
                >
                  <Icon name="user-circle" size={18} />
                  Account
                </Link>
              </>
            ) : (
              <button type="button" onClick={openSignIn} className="btn btn-primary">
                Log in
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
