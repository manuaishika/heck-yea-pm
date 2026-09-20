import { Link } from 'react-router-dom'
import {
  questions,
  categories,
  categoryCounts,
  categorySlug,
  getQuestion,
  curveballs,
} from '../data/questions'
import { useHead } from '../lib/useHead'
import { authEnabled } from '../lib/supabase'
import { Page, PageHead } from '../components/Page'
import { LinkRow, Block } from '../components/ui'
import QuestionRow from '../components/QuestionRow'

const chapters = [
  ['/role', '1', 'The role', 'What a PM does. Startup vs MNC. What it is not.', 'target'],
  ['/skills', '2', 'Skills', 'Technical and non-technical, with a quiz on where you stand.', 'chart'],
  [
    '/browse',
    '3',
    'Question bank',
    `${questions.length} questions with a model answer and the mistake that sinks most candidates.`,
    'question',
  ],
  [
    '/companies',
    '4',
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
  const sample = getQuestion('monetize-x-blue-tick')

  return (
    <Page>
      <PageHead
        chapter="Heck Yea PM"
        title="Prep for your first PM interview."
        intro={
          <>
            For final-year students applying to PM intern and APM roles — including the Indian
            programs nobody else builds prep for. No paywall.
            {authEnabled
              ? ' Sign in only if you want your progress on more than one device.'
              : ' No login needed.'}
          </>
        }
      />

      <p className="flex flex-wrap gap-3">
        <Link to="/browse" className="btn btn-primary no-underline hover:no-underline">
          Browse the questions
        </Link>
        <Link to="/flashcards" className="btn no-underline hover:no-underline">
          Start flashcards
        </Link>
      </p>

      <ul className="mt-6 space-y-2">
        {chapters.map(([to, n, label, desc, icon]) => (
          <li key={to}>
            <Link to={to} className="block no-underline hover:no-underline">
              <LinkRow icon={icon} title={label} sub={desc}>
                <span className="label" aria-hidden="true">
                  {n}
                </span>
              </LinkRow>
            </Link>
          </li>
        ))}
      </ul>

      <p className="label mt-8">What a question looks like</p>
      <div className="mt-2">
        <QuestionRow question={sample} defaultOpen to={`/browse/${sample.id}`} />
      </div>

      <div className="card mt-8">
        <Block label="The one rule" rule={false}>
          <p>
            Only talk about products you use regularly. Depth beats an impressive-sounding choice
            — walk in with three real frustrations and three specific fixes for something you open
            every day.
          </p>
        </Block>
      </div>

      <p className="label mt-8">Categories</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c}>
            <Link to={`/browse?category=${categorySlug(c)}`} className="pill">
              {c.toLowerCase()} {counts[c]}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/browse?hard=1" className="pill">
            curveballs {curveballs().length}
          </Link>
        </li>
      </ul>

      <p className="prose-body mt-8">
        That is the whole site. <Link to="/role">Start with the role</Link> if you are new to
        product, or go straight to the <Link to="/browse">questions</Link>.
      </p>
    </Page>
  )
}
