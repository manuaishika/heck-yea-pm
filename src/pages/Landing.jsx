import { Link } from 'react-router-dom'
import { categories, categoryCounts, categorySlug } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'
import { CategoryTag } from '../components/ui'
import Mascot from '../components/Mascot'
import CompaniesMarquee from '../components/CompaniesMarquee'

export default function Landing() {
  useHead({
    title: null,
    description:
      'Free prep for your first PM interview. The role, the skills, a question bank, and company loops — built for students applying to APM programs.',
    path: '/',
  })
  const counts = categoryCounts()

  return (
    <Page>
      {/* hero: centred */}
      <div className="flex flex-col items-center py-8 text-center">
        <Mascot size={72} className="mb-4" />
        <p className="label text-accent">Heck Yea PM</p>
        <h1 className="mt-2">Prep for your first PM interview.</h1>
        <p className="mt-2 max-w-md text-text-muted">
          Free interview prep for PM intern and APM roles.
        </p>
        <Link to="/browse" className="btn btn-primary mt-5 no-underline hover:no-underline">
          Open the question bank
        </Link>
      </div>

      {/* categories */}
      <section className="mt-6 text-center">
        <h2 className="label">Categories</h2>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <li key={c}>
              <CategoryTag category={c} count={counts[c]} to={`/browse?category=${categorySlug(c)}`} />
            </li>
          ))}
        </ul>
      </section>

      {/* companies marquee */}
      <section className="mt-10 text-center">
        <h2 className="label">Companies</h2>
        <div className="mt-3">
          <CompaniesMarquee />
        </div>
      </section>
    </Page>
  )
}
