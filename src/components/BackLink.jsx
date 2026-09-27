import { Link, useLocation, useNavigate } from 'react-router-dom'

/**
 * "← Back" at the top of every detail page. Goes back in history when the
 * visitor got here from inside the site; on a cold landing (a shared link)
 * there's nothing to go back to, so it links to the parent page instead.
 */
export default function BackLink({ to, label = 'Back' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const hasHistory = location.key !== 'default'

  return (
    <Link
      to={to}
      onClick={(e) => {
        if (!hasHistory) return
        e.preventDefault()
        navigate(-1)
      }}
      className="btn btn-sm mb-4 no-underline hover:no-underline"
    >
      <span aria-hidden="true">←</span> {label}
    </Link>
  )
}
