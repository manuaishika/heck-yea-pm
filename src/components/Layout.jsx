import { useEffect, useId, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Contents from './Contents'

export default function Layout() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetId = useId()
  const location = useLocation()
  const toggleRef = useRef(null)

  useEffect(() => {
    setSheetOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sheetOpen) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setSheetOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[6px] focus:border-2 focus:border-rule-hard focus:bg-paper focus:px-3 focus:py-1.5 focus:text-sm"
      >
        Skip to content
      </a>

      {/* mobile top bar */}
      <div className="flex items-center justify-between border-b-2 border-rule-hard px-4 py-2 lg:hidden">
        <Link to="/" className="text-md font-bold tracking-tight text-ink no-underline">
          Heck Yea PM
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="chip"
          aria-expanded={sheetOpen}
          aria-controls={sheetId}
          onClick={() => setSheetOpen((v) => !v)}
        >
          {sheetOpen ? 'Close' : 'Contents'}
        </button>
      </div>

      {/* mobile contents sheet */}
      <div
        id={sheetId}
        hidden={!sheetOpen}
        className="border-b-2 border-rule-hard px-4 py-3 lg:hidden"
      >
        <Contents onNavigate={() => setSheetOpen(false)} />
      </div>

      <div className="mx-auto flex max-w-5xl">
        {/* desktop rail */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r-2 border-rule-hard px-5 py-5 lg:block">
          <Link
            to="/"
            className="text-md font-bold tracking-tight text-ink no-underline"
          >
            Heck Yea PM
          </Link>
          <p className="label mt-0.5 mb-5">first PM loop, prepped</p>
          <Contents />
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
