import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import PageContainer from './PageContainer'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-button focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <TopNav />

      <main id="main" className="flex-1">
        <PageContainer>
          <div className="py-6">
            <Outlet />
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  )
}
