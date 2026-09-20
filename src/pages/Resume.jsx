import { resume } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import Rich from '../components/Rich'

export default function Resume() {
  useHead({
    title: 'Resume',
    description:
      'What a PM intern resume needs when you have no PM experience: the bullet formula, what goes in each section, and a checklist.',
    path: '/resume',
  })

  const { intro, bulletFormula, sections, mistakes, checklist } = resume

  return (
    <Page wide>
      <PageHead
        chapter="Prepare"
        title="Resume"
        intro={<Rich>{intro}</Rich>}
      />

      {/* bullet formula */}
      <h2 className="mt-6 text-lg">Every bullet, one formula</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {bulletFormula.parts.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            <span className="panel px-2 py-1 text-ink">
              {p}
            </span>
            {i < bulletFormula.parts.length - 1 && (
              <span className="text-ink-faint">+</span>
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="border-l-4 border-rule pl-3">
          <span className="label !text-ink-faint">weak</span>
          <p className="mt-0.5 text-ink-faint">{bulletFormula.bad}</p>
        </div>
        <div className="border-l-4 border-accent pl-3">
          <span className="label !text-ink">strong</span>
          <p className="mt-0.5 leading-relaxed text-ink">
            <Rich>{bulletFormula.good}</Rich>
          </p>
        </div>
      </div>

      {/* sections */}
      <h2 className="mt-10 text-lg">What goes where</h2>
      <div className="mt-3 border-t border-rule">
        {sections.map((s) => (
          <div
            key={s.name}
            className="grid gap-1 border-b border-rule py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
          >
            <div className="text-sm font-semibold text-ink">{s.name}</div>
            <ul className="space-y-1">
              {s.keep.map((k) => (
                <li key={k} className="text-sm text-ink-dim">
                  <Rich>{k}</Rich>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* mistakes */}
      <h2 className="mt-10 text-lg">Common mistakes</h2>
      <ul className="mt-3 border-t border-rule">
        {mistakes.map((m) => (
          <li key={m} className="border-b border-rule py-2 text-sm text-ink-dim">
            <span className="text-ink-faint">✕</span> <Rich>{m}</Rich>
          </li>
        ))}
      </ul>

      {/* checklist */}
      <h2 className="mt-10 text-lg">Before you send it</h2>
      <ul className="mt-3 border-t border-rule">
        {checklist.map((c) => (
          <li key={c} className="border-b border-rule py-2 text-sm text-ink">
            <span className="font-bold text-ink">✓</span> <Rich>{c}</Rich>
          </li>
        ))}
      </ul>
    </Page>
  )
}
