import { Link } from 'react-router-dom'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

export default function NotFound() {
  useHead({ title: 'Not found', description: 'That page does not exist.' })

  return (
    <Page>
      <PageHead
        chapter="404"
        title="That page does not exist."
        intro="The link may be mistyped, or a question id may have changed."
      />
      <Link to="/browse" className="btn btn-primary no-underline hover:no-underline">
        Go to the question bank
      </Link>
    </Page>
  )
}
