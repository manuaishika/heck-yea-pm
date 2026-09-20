import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const STATUS = {
  idle: '',
  syncing: 'Syncing…',
  synced: 'Synced across your devices.',
  error: 'Could not sync just now. Your progress is safe on this device and will retry.',
}

export default function Login() {
  const { enabled, loading, user, syncStatus, signInWithEmail, signInWithGoogle, signOut } =
    useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')

  useHead({
    title: 'Sign in',
    description:
      'Sign in to keep your saves, flashcard progress and quiz results across devices.',
    path: '/login',
  })

  async function sendLink(e) {
    e.preventDefault()
    if (!email.trim()) return
    setState('sending')
    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setState('error')
      setMessage(error.message || 'Something went wrong. Try again.')
    } else {
      setState('sent')
    }
  }

  async function google() {
    setState('idle')
    const { error } = await signInWithGoogle()
    if (error) {
      setState('error')
      setMessage(error.message || 'Something went wrong. Try again.')
    }
  }

  return (
    <Page>
      <PageHead
        chapter="Account"
        title={user ? 'Your account' : 'Sign in'}
        intro="Optional. The site works without an account. Sign in only to keep your saved questions, flashcard progress and quiz results on every device."
      />

      {!enabled ? (
        <p className="prose-body mt-4">
          Sign-in is not switched on for this site yet. Everything still works, and your
          progress stays on this device.
        </p>
      ) : loading ? (
        <p className="label mt-4">Loading…</p>
      ) : user ? (
        <div className="mt-4">
          <div className="card p-4">
            <p className="label">Signed in as</p>
            <p className="mt-1 text-body font-semibold text-text">{user.email}</p>
            <p className="mt-2 text-body text-text-muted" aria-live="polite">
              {STATUS[syncStatus] || ''}
            </p>
          </div>
          <p className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={signOut}>
              Sign out
            </button>
            <Link to="/" className="btn btn-primary no-underline">
              Keep studying
            </Link>
          </p>
          <p className="prose-body mt-3">
            Signing out removes your saves, marks and quiz results from this device. They stay in
            your account.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <form onSubmit={sendLink} className="card p-4">
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="mt-1 w-full rounded-button border border-border bg-surface px-3 py-2 text-body placeholder:text-text-muted focus-visible:border-accent"
            />
            <p className="mt-3 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
              </button>
              <span className="label">no password</span>
            </p>
            <p aria-live="polite" className="mt-3 text-body text-text-muted">
              {state === 'sent' && 'Check your inbox. The link signs you in on this device.'}
              {state === 'error' && message}
            </p>
          </form>

          <p className="label mt-5">Or</p>
          <p className="mt-2">
            <button type="button" className="btn" onClick={google}>
              Continue with Google
            </button>
          </p>
        </div>
      )}
    </Page>
  )
}
