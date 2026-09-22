/**
 * Standard page frame: a 12-column grid with one side margin and one gutter
 * (both from the token scale). Content sits in the same left-aligned columns
 * on every route. `wide` uses the full 12 columns, for tables and
 * comparisons; the default spans 8, for a reading measure.
 */
export function Page({ children, wide = false }) {
  return (
    <div className="grid grid-cols-12 gap-x-6 px-4 py-6 sm:px-6">
      <div className={wide ? 'col-span-12' : 'col-span-12 lg:col-span-8'}>{children}</div>
    </div>
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
