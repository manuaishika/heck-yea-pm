import { Link } from 'react-router-dom'
import { skills } from '../data/guides'
import { categorySlug, getQuestion } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row, Bullets, iconForSkill } from '../components/ui'
import Chain from '../components/diagrams/Chain'
import Flowchart from '../components/Flowchart'

// One practice question per technical topic, picked by hand for fit. Two
// topics (A/B tests, SQL) have no dedicated question in the bank yet, so
// their flow falls back to the filtered category instead of a forced match.
const PRACTICE = {
  apis: 'break-down-a-product-into-tech-architecture',
  databases: 'design-cloud-file-storage',
  'client-server': 'manage-release-cycles-in-agile',
  'latency-caching': 'build-a-rate-limiter',
  'data-pipelines': 'engagement-declining-three-questions',
  'ml-features': 'cold-start-recommendations',
  nfrs: 'nfrs-for-ecommerce-before-a-sale',
}

function SkillRow({ skill }) {
  return (
    <li id={skill.slug}>
      <Row icon={iconForSkill(skill.slug)} title={skill.name} sub={skill.gist}>
        <div className="p-4">
          <Bullets items={skill.need} />
        </div>
        <div className="px-4 pb-4">
          <Link
            to={`/browse?category=${categorySlug(skill.bankCategory)}`}
            className="btn btn-primary no-underline hover:no-underline"
          >
            {skill.bankCategory} questions
          </Link>
        </div>
      </Row>
    </li>
  )
}

function Track({ id, label, intro, list, render, children }) {
  return (
    <section id={id} className="mt-8 scroll-mt-4">
      <div className="flex items-baseline gap-2">
        <h2>{label}</h2>
        <span className="label">{list.length} skills</span>
      </div>
      <p className="mt-1 text-text-muted">{intro}</p>
      {children}
      {render ? (
        list.map((s) => <div key={s.slug}>{render(s)}</div>)
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((s) => (
            <SkillRow key={s.slug} skill={s} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Skills() {
  useHead({
    title: 'Skills',
    description:
      'The technical and non-technical skills a PM interview tests, each as a flow: what it is, how it works, what a PM needs to know, and a practice question.',
    path: '/skills',
  })

  const { chain } = skills.technical

  return (
    <Page>
      <PageHead
        chapter="Module"
        title="Skills"
        intro="What interviews test, and how deep to go."
        aside={
          <Link to="/skills/assess" className="btn shrink-0 no-underline hover:no-underline">
            Take the quiz
          </Link>
        }
      />

      <Track
        id="technical"
        label="Technical"
        intro={skills.technical.intro}
        list={skills.technical.skills}
        render={(s) => (
          <Flowchart
            slug={s.slug}
            name={s.name}
            gist={s.gist}
            howItWorks={s.howItWorks}
            need={s.need}
            question={PRACTICE[s.slug] ? getQuestion(PRACTICE[s.slug]) : null}
            fallback={`/browse?category=${categorySlug(s.bankCategory)}`}
          />
        )}
      >
        <div className="card mt-4 p-4">
          <p className="text-text-muted">{chain.note}</p>
          <Chain steps={chain.steps} labels={chain.labels} />
          <ul className="mt-3 space-y-1">
            {chain.extras.map((e) => (
              <li key={e} className="text-text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </Track>

      <Track
        id="non-technical"
        label="Non-technical"
        intro={skills.nonTechnical.intro}
        list={skills.nonTechnical.skills}
      />
    </Page>
  )
}
