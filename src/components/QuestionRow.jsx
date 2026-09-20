import { Link } from 'react-router-dom'
import { Row, Detail, Block, Bullets, iconForCategory } from './ui'
import SaveButton from './SaveButton'

/**
 * One question as the shared expandable row. Its sections are the detail
 * panel; the tip and failure mode are labelled blocks in the same style.
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
  const sub = `${question.category}${question.hard ? ' · curveball' : ''}`

  return (
    <Row
      icon={iconForCategory(question.category)}
      title={question.question}
      sub={sub}
      open={expanded}
      onToggle={onToggle}
      defaultOpen={defaultOpen}
      action={<SaveButton id={question.id} question={question.question} />}
    >
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
      <div className="border-t border-border p-4">
        <Link to={to} className="btn btn-primary no-underline hover:no-underline">
          Open full page
        </Link>
      </div>
    </Row>
  )
}
