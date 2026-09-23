import { categorySlug } from '../../data/questions'
import { CategoryTag } from '../ui'

const order = { heavy: 0, medium: 1, light: 2 }

/**
 * "What they weight" as a list with a colour-coded weight badge: heavy /
 * medium / light each get their own badge colour (weight-heavy/-medium/
 * -light in tokens.css — used nowhere else on the site). Each label links
 * into the bank. Categories in `standout` get a star: this company weights
 * them more than most do. (Component keeps its old name; it no longer draws
 * bars.)
 *
 * @param {{ weights: [string, 'heavy'|'medium'|'light'][], standout?: string[] }} props
 */
export default function WeightBars({ weights, standout = [] }) {
  const sorted = [...weights].sort((a, b) => order[a[1]] - order[b[1]])
  const badgeClass = {
    heavy: 'bg-weight-heavy text-white',
    medium: 'bg-weight-medium text-white',
    light: 'bg-weight-light text-white',
  }
  return (
    <ul className="card divide-y divide-border">
      {sorted.map(([cat, level]) => (
        <li key={cat} className="flex items-center justify-between gap-3 px-4 py-2">
          <CategoryTag
            category={cat}
            to={`/browse?category=${categorySlug(cat)}`}
            suffix={
              standout.includes(cat) && (
                <>
                  <span aria-hidden="true">★</span>
                  <span className="sr-only"> (weighted more than at most companies)</span>
                </>
              )
            }
          />
          <span className={`rounded-pill px-2 py-0.5 text-label font-semibold uppercase tracking-wide ${badgeClass[level]}`}>
            {level}
          </span>
        </li>
      ))}
    </ul>
  )
}
