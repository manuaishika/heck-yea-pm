import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import PageContainer from './PageContainer'
import { useAuth } from '../lib/auth'

const MENU_GROUPS = [
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
      ['/skills/assess', 'Where do you stand?'],
    ],
  },
  {
    label: 'Reference',
    items: [
      ['/companies', 'Companies'],
      ['/careers', 'Careers'],
      ['/resources', 'Resources'],
      ['/resume', 'Resume'],
      ['/guesstimates', 'Guesstimates'],
    ],
  },
  {
    label: 'Site',
    items: [
      ['/directory', 'Index'],
      ['/about', 'About'],
      ['/saved', 'Saved'],
    ],
  },
]

function initials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '?'
  return name.trim().charAt(0).toUpperCase()
}

/**
 * The one nav bar, on every route: a single row of cells divided by
 * hairlines — logo, two lines of standing copy, INDEX, ACCOUNT, MENU. Sticky,
 * paper background, a hairline beneath it. On phones only logo/INDEX/MENU
 * survive; MENU opens a full-screen takeover with every section.
 */
export default function TopNav() {
  const { enabled, user, signInWithGoogle } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const menuId = useId()
  const menuBtnRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  async function openSignIn() {
    if (!enabled) {
      navigate('/login')
      return
    }
    await signInWithGoogle()
  }

  const Cell = ({ children, className = '', ...rest }) => (
    <div className={`flex items-center border-l border-border px-4 py-3 first:border-l-0 ${className}`} {...rest}>
      {children}
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-page">
        <PageContainer className="">
          <div className="flex items-stretch">
            <Cell className="border-l-0">
              <Link to="/" className="text-section font-display uppercase text-text no-underline hover:no-underline">
                Heck Yea PM
              </Link>
            </Cell>

            <Cell className="hidden min-w-0 flex-1 md:flex">
              <p className="label leading-[1.4] text-text">
                Free PM interview prep
                <br />
                Question bank
              </p>
            </Cell>

            <Cell className="hidden shrink-0 lg:flex">
              <p className="label leading-[1.4] text-text">
                Always free
                <br />
                No paywall
              </p>
            </Cell>

            <Cell className="hidden shrink-0 sm:flex">
              <NavLink
                to="/directory"
                className={({ isActive }) =>
                  `label no-underline hover:text-accent hover:no-underline ${isActive ? 'text-accent' : 'text-text'}`
                }
              >
                Index
              </NavLink>
            </Cell>
            <div className="sm:hidden">
              <Cell>
                <NavLink
                  to="/directory"
                  className={({ isActive }) => `label no-underline hover:no-underline ${isActive ? 'text-accent' : 'text-text'}`}
                >
                  Index
                </NavLink>
              </Cell>
            </div>

            <Cell className="hidden shrink-0 md:flex">
              {user ? (
                <Link
                  to="/login"
                  aria-label="Account"
                  className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-pill border border-border bg-tag text-body font-semibold text-text no-underline hover:no-underline"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    initials(user)
                  )}
                </Link>
              ) : (
                <button type="button" onClick={openSignIn} className="label text-text hover:text-accent">
                  Log in
                </button>
              )}
            </Cell>

            <Cell className="shrink-0">
              <button
                ref={menuBtnRef}
                type="button"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((v) => !v)}
                className="pill min-h-9"
              >
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </Cell>
          </div>
        </PageContainer>
      </header>

      {menuOpen && (
        <div id={menuId} role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-50 overflow-y-auto bg-page">
          <PageContainer className="">
            <div className="flex items-center border-b border-l-0 border-border px-4 py-3">
              <span className="text-section font-display uppercase text-text">Menu</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="pill ml-auto min-h-9">
                Close
              </button>
            </div>

            <div className="grid gap-x-8 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
              {MENU_GROUPS.map((g) => (
                <div key={g.label} className="border-t border-border pt-3 first:border-t-0 sm:border-t-0 sm:pt-0">
                  <p className="label !text-current text-accent">{g.label}</p>
                  <ul className="mt-2">
                    {g.items.map(([to, label]) => (
                      <li key={to} className="border-b border-border">
                        <NavLink
                          to={to}
                          className={({ isActive }) =>
                            `flex min-h-11 items-center py-2 text-body no-underline hover:no-underline hover:text-accent ${
                              isActive ? 'font-semibold text-accent' : 'text-text'
                            }`
                          }
                        >
                          {label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-4">
              {user ? (
                <Link to="/login" className="btn no-underline hover:no-underline">
                  Account
                </Link>
              ) : (
                <button type="button" onClick={openSignIn} className="btn btn-primary">
                  Log in
                </button>
              )}
            </div>
          </PageContainer>
        </div>
      )}
    </>
  )
}
