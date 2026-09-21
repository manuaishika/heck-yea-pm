import { Link } from 'react-router-dom'
import { questions, categories, categoryCounts, categorySlug } from '../data/questions'
import { methods } from '../lib/methods'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { LinkRow, CategoryTag } from '../components/ui'
import CategoryGraph from '../components/CategoryGraph'

const chapters = [
  ['/role', 'Role', 'What a PM does. Startup vs MNC. What it is not.', 'target'],
  ['/skills', 'Skills', 'Technical and non-technical, with a quiz on where you stand.', 'chart'],
  [
    '/browse',
    'Questions',
    `${questions.length} questions with a model answer and the mistake that sinks most candidates.`,
    'question',
  ],
  [
    '/companies',
    'Companies',
    'Interview loops for the MNCs and the Indian APM programs, round by round.',
    'briefcase',
  ],
]

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
      <PageHead
        chapter="Heck Yea PM"
        title="Prep for your first PM interview."
        intro="Free interview prep for PM intern and APM roles."
      />

      <p>
        <Link to="/browse" className="btn btn-primary no-underline hover:no-underline">
          Open the question bank
        </Link>
      </p>

      <ul className="mt-6 space-y-2">
        {chapters.map(([to, label, desc, icon]) => (
          <li key={to}>
            <Link to={to} className="block no-underline hover:no-underline">
              <LinkRow icon={icon} title={label} sub={desc} />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <h2 className="label">Categories</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c}>
              <CategoryTag category={c} count={counts[c]} to={`/browse?category=${categorySlug(c)}`} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="label">Methods</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {methods.map((m) => (
            <li key={m.slug}>
              <Link to={`/methods/${m.slug}`} className="pill">
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="label">Your progress</h2>
        <div className="card mt-2 p-4">
          <CategoryGraph />
        </div>
      </section>
    </Page>
  )
}
