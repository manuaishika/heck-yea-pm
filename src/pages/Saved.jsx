import { Link } from 'react-router-dom'
import { getQuestion } from '../data/questions'
import { useSaved } from '../lib/useSaved'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import QuestionList from '../components/QuestionList'

export default function Saved() {
  const { savedIds, canPersist } = useSaved()
  useHead({ title: 'Saved', description: 'Questions you saved to come back to.', path: '/saved' })

  const items = savedIds.map(getQuestion).filter(Boolean)

  return (
    <Page>
      <PageHead
        title="Saved"
        intro="Questions you flagged to revisit. Stored on this device only."
      />

      {!canPersist && (
        <p className="prose-body mt-3">
          This browser is not storing data, so this list clears when you close
          the tab.
        </p>
      )}

      {items.length > 0 ? (
        <>
          <p aria-live="polite" className="label mt-4">
            {items.length} saved
          </p>
          <div className="mt-2">
            <QuestionList questions={items} linkTo={(q) => `/browse/${q.id}`} />
          </div>
        </>
      ) : (
        <div className="mt-5">
          <p className="text-ink">Nothing saved yet.</p>
          <p className="prose-body mt-1.5">
            Use the save button on any question in the{' '}
            <Link to="/browse">question bank</Link>.
          </p>
        </div>
      )}
    </Page>
  )
}
