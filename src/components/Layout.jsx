import { Outlet, useLocation } from 'react-router-dom'
import IconRail from './IconRail'
import TabBar from './TabBar'
import TopNav from './TopNav'

export default function Layout() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-button focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {isLanding && <TopNav />}

      <div className="mx-auto flex max-w-6xl">
        {!isLanding && (
          <aside className="sticky top-0 hidden h-screen w-20 shrink-0 border-r border-border bg-surface lg:block">
            <IconRail />
          </aside>
        )}

        <main id="main" className={`min-w-0 flex-1 ${!isLanding ? 'pb-20 lg:pb-0' : ''}`}>
          <Outlet />
        </main>
      </div>

      {!isLanding && <TabBar />}
    </div>
  )
}
