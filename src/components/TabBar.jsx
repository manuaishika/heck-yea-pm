import { Link, useLocation } from 'react-router-dom'
import { Icon } from './ui'
import { RAIL_ITEMS, activeKeyFor } from '../lib/nav'

/** The mobile nav: a fixed bottom bar, icon + short label per module, same set as the rail. */
export default function TabBar() {
  const { pathname } = useLocation()
  const active = activeKeyFor(pathname)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex overflow-x-auto">
        {RAIL_ITEMS.map((item) => {
          const on = item.key === active
          return (
            <li key={item.key} className="shrink-0">
              <Link
                to={item.to}
                aria-label={item.label}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 w-16 flex-col items-center justify-center gap-1 no-underline hover:no-underline ${
                  on ? 'text-accent' : 'text-text-muted'
                }`}
              >
                <Icon name={item.icon} />
                <span className="text-[10px] font-semibold leading-none">{item.short}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
