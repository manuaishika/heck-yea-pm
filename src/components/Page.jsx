/**
 * Standard page frame. Outer width and side margin come from PageContainer
 * (Layout.jsx) — this only decides how wide the content itself runs inside
 * that shared container. `wide` fills it, for tables and comparisons; the
 * default centres a narrower reading measure inside it.
 */
export function Page({ children, wide = false }) {
  return <div className={wide ? '' : 'mx-auto max-w-[52rem]'}>{children}</div>
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
