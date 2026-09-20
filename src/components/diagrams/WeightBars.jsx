import { Link } from 'react-router-dom'
import { categorySlug } from '../../data/questions'

const width = { heavy: '100%', medium: '58%', light: '26%' }
const order = { heavy: 0, medium: 1, light: 2 }

/**
 * "What they weight" as a sorted bar chart. Each label links into the bank.
 * Categories in `standout` get a star: this company weights them more than
 * most do.
 *
 * @param {{ weights: [string, 'heavy'|'medium'|'light'][], standout?: string[] }} props
 */
export default function WeightBars({ weights, standout = [] }) {
  const sorted = [...weights].sort((a, b) => order[a[1]] - order[b[1]])
  return (
    <ul className="mt-3 space-y-2">
      {sorted.map(([cat, level]) => (
        <li key={cat} className="flex items-center gap-3">
          <Link
            to={`/browse?category=${categorySlug(cat)}`}
            className="w-24 shrink-0 text-sm text-ink no-underline hover:text-accent"
          >
            {cat}
            {standout.includes(cat) && (
              <>
                <span aria-hidden="true" className="ml-1 font-bold">
                  ★
                </span>
                <span className="sr-only"> (weighted more than at most companies)</span>
              </>
            )}
          </Link>
          <span className="h-3 flex-1 overflow-hidden rounded-[3px] border-2 border-ink bg-paper" aria-hidden="true">
            <span
              className="block h-full bg-accent"
              style={{ width: width[level] }}
            />
          </span>
          <span className="label w-12 shrink-0 text-right">{level}</span>
        </li>
      ))}
    </ul>
  )
}
