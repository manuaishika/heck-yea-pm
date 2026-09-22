import { Link } from 'react-router-dom'

const LINKS = [
  ['/role', 'Role & Skills'],
  ['/browse', 'Questions'],
  ['/companies', 'Companies'],
  ['/careers', 'Careers & India'],
  ['/ai', 'AI for PMs'],
]

/** The landing page's own nav: full top bar, no icon rail. Every other route uses IconRail/TabBar. */
export default function TopNav() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <Link to="/" className="text-section font-semibold text-text no-underline hover:no-underline">
        Heck Yea PM
      </Link>
      <nav aria-label="Main" className="hidden flex-wrap gap-5 md:flex">
        {LINKS.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="text-text-muted no-underline hover:text-text hover:no-underline"
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link to="/browse" className="btn btn-primary shrink-0 no-underline hover:no-underline">
        Question bank
      </Link>
    </header>
  )
}
