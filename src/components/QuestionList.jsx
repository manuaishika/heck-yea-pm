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
    <div className="border-t-2 border-rule-hard">
      {questions.map((q) => (
        <QuestionRow
          key={q.id}
          question={q}
          expanded={expanded.has(q.id)}
          onToggle={() => toggle(q.id)}
          to={linkTo(q)}
        />
      ))}
    </div>
  )
}
