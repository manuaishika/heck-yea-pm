import { Link } from 'react-router-dom'
import { role, skills } from '../data/guides'
import { questions } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row } from '../components/ui'
import DonutChart from '../components/DonutChart'
import FlowMap from '../components/diagrams/FlowMap'

const AI_COUNT = questions.filter((q) => q.topic === 'ai').length
const BEHAVIORAL_COUNT = questions.filter((q) => q.category === 'Behavioral').length

// Slice colour is assigned by rank inside DonutChart (biggest = darkest
// chart blue), not fixed per area, so nothing here names a colour.
const SLICES = [
  {
    key: 'technical',
    label: 'Technical',
    note: 'How software works, well enough to spot risk.',
    count: skills.technical.skills.length,
    unit: 'skills',
    to: '/skills#technical',
  },
  {
    key: 'non-technical',
    label: 'Non-technical',
    note: 'Research, prioritisation, writing, stakeholders.',
    count: skills.nonTechnical.skills.length,
    unit: 'skills',
    to: '/skills#non-technical',
  },
  {
    key: 'behavioral',
    label: 'Behavioral',
    note: 'How you’ve actually worked, told well.',
    count: BEHAVIORAL_COUNT,
    unit: 'questions',
    to: '/browse?category=behavioral',
  },
  {
    key: 'ai',
    label: 'AI',
    note: 'Baseline literacy for a PM role now.',
    count: AI_COUNT,
    unit: 'questions',
    to: '/browse?topic=ai',
  },
]

export default function Role() {
  useHead({
    title: 'Role & Skills',
    description:
      'What a product manager actually does, and the technical, non-technical, behavioral and AI ground a PM interview covers.',
    path: '/role',
  })

  const { root, sub, flow } = role.whatPmDoes

  return (
    <Page>
      <PageHead chapter="Module" title="Role & Skills" intro={root} />

      <Row icon="chart" title="What makes a PM" sub="Tap a slice or a card." defaultOpen>
        <div className="p-4">
          <DonutChart slices={SLICES} />
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
