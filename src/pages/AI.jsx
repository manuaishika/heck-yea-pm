import ai from '../data/ai.json'
import { validateAI } from '../lib/ai-schema'
import { getQuestion, questions } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Block } from '../components/ui'
import Flowchart from '../components/Flowchart'
import ScrollProgress from '../components/ScrollProgress'

validateAI(
  ai,
  questions.map((q) => q.id)
)

export default function AI() {
  useHead({
    title: 'AI for PMs',
    description: 'AI literacy for product management interviews: how LLMs work, when AI is the wrong call, and how to evaluate an AI feature.',
    path: '/ai',
  })

  return (
    <Page>
      <ScrollProgress />
      <PageHead
        chapter="Module · Draft"
        title="AI for PMs"
        intro={ai.intro}
      />

      {ai.topics.map((t) => (
        <Flowchart
          key={t.slug}
          slug={t.slug}
          name={t.name}
          gist={t.gist}
          howItWorks={t.howItWorks}
          need={t.need}
          question={t.practiceId ? getQuestion(t.practiceId) : null}
          fallback="/browse?topic=ai"
        />
      ))}

      <div className="card mt-8">
        <Block label="Responsible AI" rule={false}>
          <p className="text-text-muted">{ai.responsibleAi.note}</p>
        </Block>
      </div>
    </Page>
  )
}
