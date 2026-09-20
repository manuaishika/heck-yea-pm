import { Link } from 'react-router-dom'
import { brandFor, logoSrc } from '../lib/companyMeta'

const opensNew = (name) => `${name} — official site, opens in a new tab`

/**
 * A company as a tag pill: logo + name, linking out to the company's own site
 * in a new tab. Companies we have no site for fall back to a search link.
 */
export default function CompanyMark({ name }) {
  const brand = brandFor(name)

  if (!brand) {
    return (
      <Link to={`/browse?q=${encodeURIComponent(name)}`} className="pill">
        {name}
      </Link>
    )
  }

  const src = logoSrc(brand)
  return (
    <a
      href={brand.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={opensNew(name)}
      title={opensNew(name)}
      className="pill"
    >
      {src && (
        <img
          src={src}
          alt=""
          width="16"
          height="16"
          loading="lazy"
          className="size-4 rounded-button"
        />
      )}
      <span>{name}</span>
      <span aria-hidden="true">↗</span>
    </a>
  )
}

/** The bare logo image (no link, no frame), or null if we have none. */
export function CompanyLogo({ name, size = 'size-6' }) {
  const src = logoSrc(brandFor(name))
  if (!src) return null
  return <img src={src} alt="" width="24" height="24" className={`${size} shrink-0 rounded-button`} />
}

/** Just the logo, as a link to the company's own site. */
export function CompanyLogoLink({ name, size = 'size-8', className = '' }) {
  const brand = brandFor(name)
  const src = logoSrc(brand)
  if (!brand || !src) return null

  return (
    <a
      href={brand.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={opensNew(name)}
      title={opensNew(name)}
      className={`shrink-0 rounded-button border border-border bg-surface p-1 ${className}`}
    >
      <img src={src} alt="" width="40" height="40" className={`${size} rounded-button`} />
    </a>
  )
}
