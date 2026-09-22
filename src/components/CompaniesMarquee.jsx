import { Link } from 'react-router-dom'
import companiesData from '../data/companies.json'

const companies = companiesData.companies
const loop = [...companies, ...companies] // duplicated once for a seamless loop

const maskStyle = {
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
  maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
}

/**
 * Company names flowing end to end in an infinite loop, name chips (not
 * logos). Pauses on hover; a name opens that company's profile. Under
 * prefers-reduced-motion, a plain wrapped list replaces the loop entirely.
 */
export default function CompaniesMarquee() {
  return (
    <div className="relative overflow-hidden" style={maskStyle}>
      <ul className="marquee-track motion-reduce:hidden flex w-max items-center gap-3 group-hover:[animation-play-state:paused] hover:[animation-play-state:paused]">
        {loop.map((c, i) => (
          <li key={`${c.slug}-${i}`}>
            <Link to={`/companies/${c.slug}`} className="pill whitespace-nowrap">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="hidden flex-wrap items-center justify-center gap-3 motion-reduce:flex">
        {companies.map((c) => (
          <li key={c.slug}>
            <Link to={`/companies/${c.slug}`} className="pill whitespace-nowrap">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
