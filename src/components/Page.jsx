/** Standard page frame. `wide` widens for tables and comparisons. */
export function Page({ children, wide = false }) {
  return (
    <div
      className={`px-4 py-8 sm:px-8 lg:px-10 ${wide ? 'max-w-3xl' : 'max-w-[42rem]'}`}
    >
      {children}
    </div>
  )
}

/** h1 block with the hard rule under it. */
export function PageHead({ chapter, title, intro, aside = null }) {
  return (
    <header className="border-b border-rule-hard pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {chapter && <p className="label">{chapter}</p>}
          <h1 className="mt-1 text-2xl">{title}</h1>
        </div>
        {aside}
      </div>
      {intro && <p className="mt-3 text-md text-ink-dim">{intro}</p>}
    </header>
  )
}

/**
 * A labelled block: mono label hangs in the left margin on desktop, stacks
 * above on mobile. `accent` marks it as an opinion / warning.
 */
export function MarginRow({ label, accent = false, children }) {
  return (
    <section className="margin-row">
      <h2 className={`margin-label ${accent ? '!text-accent' : ''}`}>{label}</h2>
      <div
        className={
          accent
            ? 'border-l-2 border-accent pl-3.5 sm:border-0 sm:pl-0'
            : 'min-w-0'
        }
      >
        {children}
      </div>
    </section>
  )
}
