import { Link } from 'react-router-dom'
import { methodsForQuestion } from '../lib/methods'
import { Block } from './ui'

/** The "Method" line on a question: links to the methods for its category. Renders nothing when there are none. */
export default function MethodLinks({ question, rule = true }) {
  const list = methodsForQuestion(question)
  if (list.length === 0) return null
  return (
    <Block label="Method" rule={rule}>
      <ul className="flex flex-wrap gap-2">
        {list.map((m) => (
          <li key={m.slug}>
            <Link to={`/methods/${m.slug}`} className="pill">
              {m.name}
            </Link>
          </li>
        ))}
      </ul>
    </Block>
  )
}
