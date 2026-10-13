import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import PageContainer from './PageContainer'
import ThemeToggle from './ThemeToggle'

const MENU_GROUPS = [
  {
    label: 'Learn',
    items: [
      ['/role', 'Role & Skills'],
      ['/skills', 'Skills'],
      ['/ai', 'AI for product managers'],
      ['/methods', 'Methods'],
    ],
  },
  {
    label: 'Practice',
    items: [
      ['/today', 'Today’s question'],
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
      ['/about', 'About'],
      ['/saved', 'Saved'],
    ],
  },
]

/**
 * The one nav bar, on every route: a single row of cells divided by
 * hairlines — logo, theme toggle, MENU. Sticky,
 * paper background, a hairline beneath it. MENU opens a full-screen takeover with every section.
 */
export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
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
              <Link to="/" className="whitespace-nowrap text-[1.125rem] font-semibold tracking-tight text-text no-underline hover:no-underline sm:text-section">
                Product Practice
              </Link>
            </Cell>

            <div className="flex-1" />

            <Cell className="shrink-0">
              <ThemeToggle />
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
              <span className="text-section font-semibold text-text">Menu</span>
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

          </PageContainer>
        </div>
      )}
    </>
  )
}
