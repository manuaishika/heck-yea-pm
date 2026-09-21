import { Link } from 'react-router-dom'
import { methods, questionsForMethod } from '../lib/methods'
import { categories } from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { LinkRow, CategoryTag } from '../components/ui'

const ICONS = {
  'star-car': 'chat',
  sbi: 'users',
  circles: 'target',
  'user-pain-solution': 'flow',
  'north-star': 'chart',
  aarrr: 'flow',
  heart: 'spark',
  'metric-drop': 'split',
  'rice-moscow-kano': 'list',
  'tam-sam-som': 'briefcase',
  'three-cs': 'map',
}

export default function Methods() {
  useHead({
    title: 'Methods',
    description:
      'The answering frameworks PM candidates use: STAR, CIRCLES, North Star, AARRR, HEART, RICE, TAM/SAM/SOM and more, each with steps and a worked example.',
    path: '/methods',
  })

  // a method sits under the first category it serves
  const groups = categories
    .map((cat) => ({ cat, list: methods.filter((m) => m.categories[0] === cat) }))
    .filter((g) => g.list.length > 0)

  return (
    <Page>
      <PageHead
        chapter="Library"
        title="Methods"
        intro="The frameworks for structuring an answer, by the kind of question."
      />

      {groups.map(({ cat, list }) => (
        <section key={cat} className="mt-8 first-of-type:mt-0">
          <div className="flex items-center gap-2">
            <CategoryTag category={cat} />
            <span className="label">
              {list.length} {list.length === 1 ? 'method' : 'methods'}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {list.map((m) => (
              <li key={m.slug}>
                <Link to={`/methods/${m.slug}`} className="block no-underline hover:no-underline">
                  <LinkRow
                    icon={ICONS[m.slug] || 'dot'}
                    category={cat}
                    title={m.name}
                    sub={m.focus}
                  >
                    <span className="label" aria-hidden="true">
                      {questionsForMethod(m).length}
                    </span>
                  </LinkRow>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  )
}
