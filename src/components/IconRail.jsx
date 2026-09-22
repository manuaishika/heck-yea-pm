import { Link, useLocation } from 'react-router-dom'
import { Icon } from './ui'
import { RAIL_ITEMS, activeKeyFor } from '../lib/nav'

/**
 * The desktop nav on every route except the landing page: a vertical rail
 * of rounded tiles, one per module. The active tile fills near-black; the
 * rest are hairline-bordered. A tooltip shows the label on hover or focus.
 */
export default function IconRail() {
  const { pathname } = useLocation()
  const active = activeKeyFor(pathname)

  return (
    <nav aria-label="Main" className="flex h-full flex-col items-center gap-2 py-4">
      <Link
        to="/"
        aria-label="Heck Yea PM — home"
        className="mb-2 grid size-11 shrink-0 place-items-center rounded-button text-section font-semibold text-accent no-underline hover:no-underline"
      >
        H
      </Link>

      <ul className="flex flex-1 flex-col gap-2">
        {RAIL_ITEMS.map((item) => {
          const on = item.key === active
          return (
            <li key={item.key} className="group relative">
              <Link
                to={item.to}
                aria-label={item.label}
                aria-current={on ? 'page' : undefined}
                className={`grid size-11 place-items-center rounded-button border no-underline hover:no-underline ${
                  on
                    ? 'border-text bg-text text-surface'
                    : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
                }`}
              >
                <Icon name={item.icon} />
              </Link>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-button bg-text px-2 py-1 text-label font-semibold !normal-case !tracking-normal text-surface opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {item.label}
              </span>
            </li>
          )
        })}
      </ul>

      <Link
        to="/about"
        aria-label="About"
        className={`group relative grid size-9 shrink-0 place-items-center rounded-button no-underline hover:no-underline ${
          pathname === '/about' ? 'text-text' : 'text-text-muted hover:text-text'
        }`}
      >
        <Icon name="info" size={15} />
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-button bg-text px-2 py-1 text-label font-semibold !normal-case !tracking-normal text-surface opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          About
        </span>
      </Link>
    </nav>
  )
}
