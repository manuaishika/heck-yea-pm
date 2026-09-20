import { Link } from 'react-router-dom'
import { categorySlug } from '../../data/questions'

const order = { heavy: 0, medium: 1, light: 2 }

/**
 * "What they weight" as plain text with accent emphasis: heavy is accent and
 * semibold, medium is normal, light is muted. Each label links into the bank.
 * Categories in `standout` get a star: this company weights them more than
 * most do. (Component keeps its old name; it no longer draws bars.)
 *
 * @param {{ weights: [string, 'heavy'|'medium'|'light'][], standout?: string[] }} props
 */
export default function WeightBars({ weights, standout = [] }) {
  const sorted = [...weights].sort((a, b) => order[a[1]] - order[b[1]])
  const levelClass = {
    heavy: 'font-semibold text-accent',
    medium: 'text-text',
    light: 'text-text-muted',
  }
  return (
    <ul className="card divide-y divide-border">
      {sorted.map(([cat, level]) => (
        <li key={cat} className="flex items-baseline justify-between gap-3 px-4 py-2">
          <Link
            to={`/browse?category=${categorySlug(cat)}`}
            className="text-text no-underline hover:text-accent"
          >
            {cat}
            {standout.includes(cat) && (
              <>
                <span aria-hidden="true" className="ml-1 font-semibold text-accent">
                  ★
                </span>
                <span className="sr-only"> (weighted more than at most companies)</span>
              </>
            )}
          </Link>
          <span className={levelClass[level]}>{level}</span>
        </li>
      ))}
    </ul>
  )
}
