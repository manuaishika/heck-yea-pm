import { Link } from 'react-router-dom'
import { browseByCompany } from '../data/guides'
import { CompanyLogo } from './CompanyMark'

/** Company tags as internal links: each opens the question bank filtered to that company. */
export default function CompanyTags({ names, className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {names.map((c) => (
        <li key={c}>
          <Link to={browseByCompany(c)} className="pill no-underline hover:no-underline" title={`All ${c} questions`}>
            <CompanyLogo name={c} size="size-4" />
            <span>{c}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
