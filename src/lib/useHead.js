import { useEffect } from 'react'

const SITE = 'Heck Yea PM'
const ORIGIN =
  typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'https://heck-yea-pm.vercel.app'

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(.+?)="(.+?)"\]/) || []
    if (key && name) el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/**
 * Per-route <title> and social meta. Client-side only — the build step
 * (scripts/prerender.mjs) writes static equivalents into the deployed HTML
 * so link previews work without JS.
 *
 * @param {{ title?: string, description?: string, path?: string }} opts
 */
export function useHead({ title, description, path } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — PM intern interview prep`
    document.title = fullTitle

    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
      setMeta('meta[name="twitter:description"]', 'content', description)
    }
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)

    const url = ORIGIN + (path || window.location.pathname)
    setMeta('meta[property="og:url"]', 'content', url)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, path])
}
