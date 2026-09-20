import { Link } from 'react-router-dom'
import { authEnabled } from '../lib/supabase'
import { questions } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const REPO = 'https://github.com/manuaishika/heck-yea-pm'

export default function About() {
  useHead({
    title: 'About',
    description:
      'What this is, who made it, and how to contribute a question, a company loop, or a correction.',
    path: '/about',
  })

  return (
    <Page>
      <PageHead
        chapter="About"
        title="About"
        intro="A free study site for your first product manager interview."
      />

      <div className="prose-body mt-4 space-y-3">
        <p>
          Four chapters — the role, the skills, a{' '}
          <Link to="/browse">{questions.length}-question bank</Link>, and{' '}
          <Link to="/companies">company loops</Link> — plus a flashcard mode that
          tracks what you know. It is built for a final-year
          student in India applying to PM intern and APM roles, on a phone, with
          a few weeks to prepare.
        </p>
        <p>
          {authEnabled ? (
            <>
              <strong>No paywall, and no account needed.</strong> It loads and
              it works, and your saves, flashcard progress and quiz results stay
              in your browser. If you choose to sign in, those three things sync
              across your devices. Nothing else is collected.
            </>
          ) : (
            <>
              <strong>No login, no paywall, no email capture.</strong> It loads and
              it works. Your saves, flashcard progress and quiz results stay in
              your browser and are never sent anywhere.
            </>
          )}
        </p>
        <p>
          The question bank was built by hand from real interview reports. The
          company loops are pieced together from public candidate accounts and
          are marked unverified until confirmed — corrections there are the most
          useful thing you can send.
        </p>
      </div>

      <h2 className="mt-8 text-section">Contribute</h2>
      <div className="prose-body mt-2 space-y-3">
        <p>
          The site is open source. To add a question, fix a company loop, or
          flag something wrong, open an issue or a pull request:
        </p>
        <p>
          <a href={REPO} target="_blank" rel="noreferrer noopener">
            {REPO.replace('https://', '')}
          </a>
        </p>
        <p>
          All content lives in typed data files with a documented shape; the
          README covers how to add each type.
        </p>
      </div>
    </Page>
  )
}
