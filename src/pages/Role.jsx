import { role } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Row } from '../components/ui'
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
      <PageHead chapter="Chapter 1" title="The role" intro={root} />

      <p className="text-text-muted">{sub}</p>

      <div className="mt-6 space-y-2">
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

        <Row
          icon="target"
          title="Every decision, three constraints"
          sub={constraints.note}
          defaultOpen
        >
          <div className="p-4">
            <Venn corners={constraints.corners} />
          </div>
        </Row>
      </div>

    </Page>
  )
}
