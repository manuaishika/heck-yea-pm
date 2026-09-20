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

  const { intro, sample, bulletFormula, sections, mistakes, checklist } = resume

  return (
    <Page wide>
      <PageHead
        chapter="Prepare"
        title="Resume"
        intro={<Rich>{intro}</Rich>}
      />

      {/* annotated sample */}
      <h2 className="mt-6 text-section">A sample, annotated</h2>
      <p className="mt-1 text-body text-text-muted">{sample.note}</p>
      <div className="card mt-3 p-4 sm:p-5">
        <div className="grid gap-1 border-b border-border pb-3 sm:grid-cols-[1fr_13rem] sm:gap-4">
          <div>
            <p className="text-section font-semibold text-text">{sample.header.name}</p>
            <p className="text-body text-text-muted">{sample.header.line}</p>
            {sample.header.links && (
              <p className="text-body text-text-muted">{sample.header.links}</p>
            )}
          </div>
          {sample.header.note && (
            <p className="border-l border-accent pl-2 text-body text-text-muted">
              {sample.header.note}
            </p>
          )}
        </div>

        {sample.blocks.map((block) => (
          <section key={block.heading} className="mt-4">
            <h3 className="label !text-text uppercase tracking-wide">{block.heading}</h3>
            {block.entries.map((entry, ei) => (
              <div key={entry.title || ei} className="mt-2">
                {entry.title && (
                  <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-body font-semibold text-text">
                    <span>{entry.title}</span>
                    {entry.meta && (
                      <span className="text-body font-normal text-text-muted">{entry.meta}</span>
                    )}
                  </p>
                )}
                <ul>
                  {entry.bullets.map((b) => (
                    <li
                      key={b.text}
                      className="grid gap-1 py-2 sm:grid-cols-[1fr_13rem] sm:gap-4"
                    >
                      <span className="text-body text-text-muted">
                        <span className="text-text">•</span> <Rich>{b.text}</Rich>
                      </span>
                      {b.note && (
                        <span className="border-l border-accent pl-2 text-body text-text-muted">
                          {b.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* bullet formula */}
      <h2 className="mt-10 text-section">Every bullet, one formula</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-body">
        {bulletFormula.parts.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            <span className="card px-2 py-1 text-text">
              {p}
            </span>
            {i < bulletFormula.parts.length - 1 && (
              <span className="text-text-muted">+</span>
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-body">
        <div className="border-l border-border pl-3">
          <span className="label !text-text-muted">weak</span>
          <p className="mt-1 text-text-muted">{bulletFormula.bad}</p>
        </div>
        <div className="border-l border-accent pl-3">
          <span className="label !text-text">strong</span>
          <p className="mt-1 leading-relaxed text-text">
            <Rich>{bulletFormula.good}</Rich>
          </p>
        </div>
      </div>

      {/* sections */}
      <h2 className="mt-10 text-section">What goes where</h2>
      <div className="mt-3 border-t border-border">
        {sections.map((s) => (
          <div
            key={s.name}
            className="grid gap-1 border-b border-border py-3 sm:grid-cols-[8rem_1fr] sm:gap-4"
          >
            <div className="text-body font-semibold text-text">{s.name}</div>
            <ul className="space-y-1">
              {s.keep.map((k) => (
                <li key={k} className="text-body text-text-muted">
                  <Rich>{k}</Rich>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* mistakes */}
      <h2 className="mt-10 text-section">Common mistakes</h2>
      <ul className="mt-3 border-t border-border">
        {mistakes.map((m) => (
          <li key={m} className="border-b border-border py-2 text-body text-text-muted">
            <span className="text-text-muted">✕</span> <Rich>{m}</Rich>
          </li>
        ))}
      </ul>

      {/* checklist */}
      <h2 className="mt-10 text-section">Before you send it</h2>
      <ul className="mt-3 border-t border-border">
        {checklist.map((c) => (
          <li key={c} className="border-b border-border py-2 text-body text-text">
            <span className="font-semibold text-text">✓</span> <Rich>{c}</Rich>
          </li>
        ))}
      </ul>
    </Page>
  )
}
