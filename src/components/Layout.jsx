import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-button focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <TopNav />

      <main id="main" className="mx-auto max-w-6xl">
        <Outlet />
      </main>
    </div>
  )
}
