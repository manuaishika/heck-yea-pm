/** Standard page frame. `wide` widens for tables and comparisons. */
export function Page({ children, wide = false }) {
  return (
    <div className={`px-4 py-6 sm:px-8 ${wide ? 'max-w-4xl' : 'max-w-3xl'}`}>{children}</div>
  )
}

/**
 * The one page header, identical on every route: eyebrow pill, page heading,
 * one muted subtitle line. Nothing else sits above the content.
 */
export function PageHead({ chapter, title, intro, aside = null }) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-56">
          {chapter && <span className="label eyebrow">{chapter}</span>}
          <h1 className={chapter ? 'mt-2' : ''}>{title}</h1>
          {intro && <p className="mt-1 text-text-muted">{intro}</p>}
        </div>
        {aside}
      </div>
    </header>
  )
}
