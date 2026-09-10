import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Scroll to top when navigating to a new page (PUSH/REPLACE to a different
 * pathname). On POP (back/forward) the browser restores the previous scroll
 * position, so we leave it alone — that's what makes "Back returns to the same
 * filtered list at the same scroll position" work. Changing only the query
 * string (filtering in Browse) does not scroll.
 */
export default function ScrollManager() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPath.current && navType !== 'POP') {
      window.scrollTo(0, 0)
    }
    prevPath.current = pathname
  }, [pathname, navType])

  return null
}
