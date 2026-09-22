import { Link } from 'react-router-dom'
import { skills } from '../data/guides'
import { categorySlug } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row, Bullets, iconForSkill } from '../components/ui'
import Chain from '../components/diagrams/Chain'

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

function Track({ label, intro, list, children }) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline gap-2">
        <h2>{label}</h2>
        <span className="label">{list.length} skills</span>
      </div>
      <p className="mt-1 text-text-muted">{intro}</p>
      {children}
      <ul className="mt-3 space-y-2">
        {list.map((s) => (
          <SkillRow key={s.slug} skill={s} />
        ))}
      </ul>
    </section>
  )
}

export default function Skills() {
  useHead({
    title: 'Skills',
    description:
      'The technical and non-technical skills a PM interview tests. Each one in a line, with what you actually need to know behind it.',
    path: '/skills',
  })

  const { chain } = skills.technical

  return (
    <Page>
      <PageHead
        chapter="Chapter 2"
        title="Skills"
        intro="What interviews test, and how deep to go."
        aside={
          <Link to="/skills/assess" className="btn shrink-0 no-underline hover:no-underline">
            Take the quiz
          </Link>
        }
      />

      <Track label="Technical" intro={skills.technical.intro} list={skills.technical.skills}>
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
        label="Non-technical"
        intro={skills.nonTechnical.intro}
        list={skills.nonTechnical.skills}
      />
    </Page>
  )
}
