import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

// Stub — item 5 of the revamp fills this in with src/data/ai.json and the
// flowchart format from Role & Skills. Routed and in the rail now so the
// nav doesn't dead-end.
export default function AI() {
  useHead({
    title: 'AI for PMs',
    description: 'AI literacy for product management interviews.',
    path: '/ai',
  })

  return (
    <Page>
      <PageHead
        chapter="Module"
        title="AI for PMs"
        intro="How LLMs work, when AI is the wrong call, and how to evaluate an AI feature."
      />
      <p className="card p-4 text-text-muted">Coming next.</p>
    </Page>
  )
}
