import { useState } from 'react'
import { Link } from 'react-router-dom'
import { skills } from '../data/guides'
import { categorySlug } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import Chain from '../components/diagrams/Chain'

function SkillCard({ skill }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="border-b border-rule">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 py-2.5 text-left"
      >
        <span
          className="mt-0.5 shrink-0 font-mono text-xs text-ink-faint"
          aria-hidden="true"
        >
          {open ? '–' : '+'}
        </span>
        <span className="min-w-0">
          <span className="text-sm font-semibold text-ink">{skill.name}</span>
          <span className="ml-2 text-sm text-ink-dim">{skill.gist}</span>
        </span>
      </button>
      {open && (
        <div className="pb-3 pl-5">
          <ul className="space-y-1">
            {skill.need.map((n) => (
              <li key={n} className="flex gap-2 text-sm text-ink-dim">
                <span aria-hidden="true" className="text-ink-faint">
                  •
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
          <Link
            to={`/browse?category=${categorySlug(skill.bankCategory)}`}
            className="mt-2 inline-block text-xs font-semibold"
          >
            practice {skill.bankCategory} questions →
          </Link>
        </div>
      )}
    </li>
  )
}

function Track({ label, intro, list, children }) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline gap-2 border-b-2 border-rule-hard pb-1">
        <h2 className="text-lg">{label}</h2>
        <span className="label">{list.length} skills</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-dim">{intro}</p>
      {children}
      <ul className="mt-3 border-t border-rule">
        {list.map((s) => (
          <SkillCard key={s.slug} skill={s} />
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
        intro="Two tracks. Tap any skill for the three things you actually need to know."
        aside={
          <Link
            to="/skills/assess"
            className="btn !px-2.5 !py-0.5 !text-[0.8125rem] no-underline"
          >
            Take the quiz
          </Link>
        }
      />

      <Track
        label="Technical"
        intro={skills.technical.intro}
        list={skills.technical.skills}
      >
        <div className="panel mt-4 p-3">
          <p className="text-sm text-ink-dim">{chain.note}</p>
          <Chain steps={chain.steps} labels={chain.labels} />
          <ul className="mt-2 space-y-1">
            {chain.extras.map((e) => (
              <li key={e} className="flex gap-2 text-xs text-ink-dim">
                <span aria-hidden="true" className="text-ink-faint">
                  •
                </span>
                <span>{e}</span>
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
