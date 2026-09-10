import { Link } from 'react-router-dom'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'

export default function NotFound() {
  useHead({ title: 'Not found', description: 'That page does not exist.' })

  return (
    <Page>
      <p className="label">404</p>
      <h1 className="mt-1 text-xl">That page does not exist.</h1>
      <p className="prose-body mt-2">
        The link may be mistyped, or a question id may have changed.
      </p>
      <p className="mt-4 text-sm">
        <Link to="/browse">Go to the question bank</Link>
      </p>
    </Page>
  )
}
