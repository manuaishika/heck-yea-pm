// Offline support. scripts/prerender.mjs writes this to dist/sw.js at build,
// filling in the version and the list of files to keep on the device.
//
//   - The app shell, the hashed JS/CSS, fonts, icons and logos are cached on
//     install, so the site opens with no connection after one visit.
//   - Pages go to the network first (always fresh when online) and fall back
//     to the cached copy, then the shell, which routes client-side.
//   - Static files are cache-first; their names carry a content hash.
//   - Other origins (sign-in, sync) and video are never touched.

const VERSION = '__VERSION__'
const CACHE = `pp-${VERSION}`
const PRECACHE = __PRECACHE__
const STATIC = /^\/(assets|fonts|logos|mascot|icons)\//
const WAIT_MS = 4000
// responses can carry `Vary: Origin`, which would make font and module requests miss
const LOOKUP = { ignoreVary: true }

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pp-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function remember(request, response) {
  if (response.ok) {
    const copy = response.clone()
    caches.open(CACHE).then((cache) => cache.put(request, copy))
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || request.headers.has('range')) return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/intro/')) return

  if (request.mode === 'navigate') {
    // a slow connection counts as offline after WAIT_MS, so a page never hangs
    const network = fetch(request).then((response) => remember(request, response))
    const timeout = new Promise((_, reject) => setTimeout(reject, WAIT_MS))
    event.respondWith(
      Promise.race([network, timeout]).catch(() => caches.match(request, LOOKUP).then((hit) => hit || caches.match('/', LOOKUP)))
    )
    return
  }

  if (STATIC.test(url.pathname) || PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.match(request, LOOKUP).then((hit) => hit || fetch(request).then((response) => remember(request, response))))
  }
})
