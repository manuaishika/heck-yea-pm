/**
 * The one outer container, used everywhere: the header's inner row and
 * every route's content both render inside this, so the logo lines up with
 * the page content's left edge and the header's right edge lines up with
 * the content's right edge. No page or component sets its own outer width
 * or side margin — this is the only place that happens.
 */
export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`}>{children}</div>
  )
}
