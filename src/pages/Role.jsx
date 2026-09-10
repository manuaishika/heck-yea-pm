import { Link } from 'react-router-dom'
import { role } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import FlowMap from '../components/diagrams/FlowMap'
import Venn from '../components/diagrams/Venn'

export default function Role() {
  useHead({
    title: 'The role',
    description:
      'What a product manager actually does, shown as the loop you run and the three constraints every decision has to satisfy.',
    path: '/role',
  })

  const { root, sub, constraints, flow } = role.whatPmDoes

  return (
    <Page>
      <PageHead chapter="Chapter 1" title="The role" />

      <p className="mt-4 text-md text-ink">{root}</p>
      <p className="mt-1 text-sm text-ink-dim">{sub}</p>

      {/* the loop */}
      <h2 className="mt-8 text-lg">The loop you run</h2>
      <p className="mt-1 text-sm text-ink-dim">
        Tap a step. This cycle repeats for every feature.
      </p>
      <FlowMap root="What to build, and why" steps={flow} />

      {/* the three constraints */}
      <h2 className="mt-10 text-lg">Every decision, three constraints</h2>
      <p className="mt-1 text-sm text-ink-dim">{constraints.note}</p>
      <Venn corners={constraints.corners} />

      <p className="mt-8 text-sm text-ink-dim">
        Next: <Link to="/skills">the skills this needs</Link>, or{' '}
        <Link to="/careers">where you can do this job</Link>.
      </p>
    </Page>
  )
}
