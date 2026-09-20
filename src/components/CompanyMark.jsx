import { Link } from 'react-router-dom'
import { brandFor, logoSrc } from '../lib/companyMeta'

const opensNew = (name) => `${name} — official site, opens in a new tab`

/**
 * A company as its logo + name, linking out to the company's own site in a
 * new tab. Companies we don't have a site for fall back to a search link.
 * Used for the "Asked at" tags.
 */
export default function CompanyMark({ name }) {
  const brand = brandFor(name)

  if (!brand) {
    return (
      <Link to={`/browse?q=${encodeURIComponent(name)}`} className="chip no-underline">
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
      className="chip !py-0.5 !pl-1 no-underline"
    >
      {src && (
        <img
          src={src}
          alt=""
          width="20"
          height="20"
          loading="lazy"
          className="h-5 w-5 rounded-[3px]"
        />
      )}
      <span>{name}</span>
      <span aria-hidden="true">↗</span>
    </a>
  )
}

/** The bare logo image (no link), or null if we have none. */
export function CompanyLogo({ name, size = 'h-8 w-8' }) {
  const src = logoSrc(brandFor(name))
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      width="40"
      height="40"
      className={`${size} shrink-0 rounded-[6px] border-2 border-ink bg-paper`}
    />
  )
}

/**
 * Just the logo tile, as a link to the company's own site. `size` is a
 * Tailwind size class pair, e.g. "h-8 w-8".
 */
export function CompanyLogoLink({ name, size = 'h-8 w-8', className = '' }) {
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
      className={`shrink-0 ${className}`}
    >
      <img
        src={src}
        alt=""
        width="40"
        height="40"
        className={`${size} rounded-[6px] border-2 border-ink bg-paper`}
      />
    </a>
  )
}
