import { useEffect, useId, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Contents'

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerId = useId()
  const location = useLocation()
  const toggleRef = useRef(null)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-button focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {/* mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Link to="/" className="font-semibold text-text no-underline hover:no-underline">
          Heck Yea PM
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="btn btn-sm"
          aria-expanded={drawerOpen}
          aria-controls={drawerId}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? 'Close' : 'Contents'}
        </button>
      </div>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close contents"
            className="absolute inset-0 bg-text/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            id={drawerId}
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto border-r border-border bg-surface p-4"
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-surface p-4 lg:block">
          <Sidebar />
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
