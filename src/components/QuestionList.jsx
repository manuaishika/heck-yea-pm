import { useState } from 'react'
import QuestionRow from './QuestionRow'

/**
 * A list of questions with independent inline expansion. Each row links to its
 * own page via `linkTo(question)` — callers pass filter state through so Back
 * returns to the same view.
 *
 * @param {{
 *   questions: import('../data/questions').Question[],
 *   linkTo: (q: import('../data/questions').Question) => string,
 * }} props
 */
export default function QuestionList({ questions, linkTo }) {
  const [expanded, setExpanded] = useState(() => new Set())

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ul className="space-y-2">
      {questions.map((q) => (
        <li key={q.id}>
          <QuestionRow
            question={q}
            expanded={expanded.has(q.id)}
            onToggle={() => toggle(q.id)}
            to={linkTo(q)}
          />
        </li>
      ))}
    </ul>
  )
}
