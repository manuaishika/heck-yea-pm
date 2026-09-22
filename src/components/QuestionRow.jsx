import { useState } from 'react'
import { Link } from 'react-router-dom'
import { shortAnswer } from '../data/questions'
import { Row, Detail, Block, Bullets, CategoryTag, iconForCategory } from './ui'
import SaveButton from './SaveButton'
import MethodLinks from './MethodLinks'

/**
 * One question as the shared expandable row. Two-layer answer: the short
 * 3-5 line version shows first, "Full answer" reveals every section, the
 * tip, and the failure mode.
 *
 * @param {{
 *   question: import('../data/questions').Question,
 *   expanded?: boolean,
 *   onToggle?: () => void,
 *   defaultOpen?: boolean,
 *   to: string,
 * }} props
 */
export default function QuestionRow({ question, expanded, onToggle, defaultOpen, to }) {
  const [fullOpen, setFullOpen] = useState(false)
  const sub = (
    <span className="flex flex-wrap items-center gap-2">
      <CategoryTag category={question.category} />
      {question.hard && <span className="label">curveball</span>}
    </span>
  )

  return (
    <Row
      icon={iconForCategory(question.category)}
      category={question.category}
      title={question.question}
      sub={sub}
      open={expanded}
      onToggle={onToggle}
      defaultOpen={defaultOpen}
      action={<SaveButton id={question.id} question={question.question} />}
    >
      <Block label="Answer" rule={false}>
        <Bullets items={shortAnswer(question)} />
        <button
          type="button"
          className="label mt-3 flex min-h-11 items-center text-accent"
          aria-expanded={fullOpen}
          onClick={() => setFullOpen((v) => !v)}
        >
          {fullOpen ? 'Show less' : 'Full answer'}
        </button>
      </Block>
      {fullOpen && (
        <>
          <Detail
            columns={question.sections.map((s) => ({
              label: s.label,
              children: <Bullets items={s.points} />,
            }))}
          />
          {question.tip && (
            <Block label="What they test">
              <p>{question.tip}</p>
            </Block>
          )}
          <Block label="Failure mode">
            <p>{question.failureMode}</p>
          </Block>
        </>
      )}
      <MethodLinks question={question} />
      <div className="border-t border-border p-4">
        <Link to={to} className="btn btn-primary no-underline hover:no-underline">
          Open full page
        </Link>
      </div>
    </Row>
  )
}
