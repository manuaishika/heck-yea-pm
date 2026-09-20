import Slides from './Slides'

/**
 * A question's answer as a slide deck: one slide per section, then a failure-mode
 * slide, then a "what they test" slide. Each slide is a titled bullet list.
 *
 * @param {{ question: import('../data/questions').Question }} props
 */
export default function AnswerSlides({ question }) {
  const slides = [
    ...question.sections.map((s) => ({
      label: s.label,
      points: s.points,
      accent: false,
    })),
    {
      label: 'Failure mode',
      points: [question.failureMode],
      accent: true,
    },
  ]
  if (question.tip) {
    slides.push({ label: 'What they test', points: [question.tip], accent: false })
  }

  return (
    <Slides label={`Answer to: ${question.question}`}>
      {slides.map((slide) => (
        <div
          key={slide.label}
          className={`card flex h-full min-h-[9rem] flex-col p-3.5 ${
            slide.accent ? 'border-l-[6px] border-l-accent' : ''
          }`}
        >
          <p className={`label ${slide.accent ? '!text-ink' : ''}`}>
            {slide.label}
          </p>
          <ul className="mt-2 space-y-2">
            {slide.points.map((p, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-ink-dim"
              >
                <span className="mt-[9px] h-1 w-1 shrink-0 bg-ink" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Slides>
  )
}
