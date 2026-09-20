import { useId } from 'react'
import { Link } from 'react-router-dom'
import Points from './Points'
import SaveButton from './SaveButton'

/**
 * One row in a question list. The question toggles an inline panel; a link
 * inside opens the dedicated page.
 *
 * @param {{
 *   question: import('../data/questions').Question,
 *   expanded: boolean,
 *   onToggle: () => void,
 *   to: string,
 * }} props
 */
export default function QuestionRow({ question, expanded, onToggle, to }) {
  const panelId = useId()

  return (
    <article className="border-b border-rule">
      <div className="flex items-start gap-3 py-2.5">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="group min-w-0 flex-1 text-left"
        >
          <span className="label flex items-center gap-2">
            <span>{question.category}</span>
            {question.hard && <span className="text-accent">· curveball</span>}
          </span>
          <span className="mt-0.5 flex items-start gap-2">
            <span aria-hidden="true" className="mt-1 shrink-0 font-mono text-ink-faint">
              {expanded ? '–' : '+'}
            </span>
            <span className="text-md text-ink group-hover:text-accent">
              {question.question}
            </span>
          </span>
        </button>
        <div className="shrink-0 pt-0.5">
          <SaveButton id={question.id} question={question.question} />
        </div>
      </div>

      <div id={panelId} hidden={!expanded} className="pb-2.5 pl-4">
        {question.sections.map((s) => (
          <Points key={s.label} label={s.label} points={s.points} />
        ))}

        <section className="mt-3 border-l-4 border-accent pl-3">
          <p className="label !text-ink">Failure mode</p>
          <p className="mt-1 text-sm text-ink-dim">{question.failureMode}</p>
        </section>

        <p className="mt-3 text-sm">
          <Link to={to}>Open full page</Link>
        </p>
      </div>
    </article>
  )
}
