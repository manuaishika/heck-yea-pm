import { Link } from 'react-router-dom'
import { role } from '../data/guides'
import { useHead } from '../lib/useHead'
import { useMarkProgress } from '../lib/useProgress'
import { Page, PageHead } from '../components/Page'
import { Row } from '../components/ui'
import InterviewWeights from '../components/InterviewWeights'
import FlowMap from '../components/diagrams/FlowMap'

export default function Role() {
  useMarkProgress('progress.role')
  useHead({
    title: 'Role & Skills',
    description:
      'What a product manager does, and the technical, non-technical, behavioral and AI ground a product interview covers.',
    path: '/role',
  })

  const { root, sub, flow } = role.whatPmDoes

  return (
    <Page>
      <PageHead chapter="Module" title="Role & Skills" intro={root} />

      <Row icon="chart" title="What the interview weighs" sub="Across every loop we have a source for. Tap a company." defaultOpen>
        <div className="p-4">
          <InterviewWeights />
        </div>
      </Row>

      <p className="mt-6 text-text-muted">{sub}</p>

      <div className="mt-6">
        <Row
          icon="flow"
          title="The loop you run"
          sub="Tap a step. This cycle repeats for every feature."
          defaultOpen
        >
          <div className="p-4">
            <FlowMap root="What to build, and why" steps={flow} />
          </div>
        </Row>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-text-muted">
        <Link to="/skills">Every skill, in depth</Link>
      </p>
    </Page>
  )
}
