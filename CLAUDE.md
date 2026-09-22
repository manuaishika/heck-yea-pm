# Heck Yea PM

Free PM intern / APM interview prep site. Vite + React 19 + Tailwind v4, deployed to Vercel. Built for a final-year student in India, on a phone, a few weeks from an interview.

## Product stance

All content is readable signed-out. Login is optional and only syncs progress across devices. Email is opt-in.

## Stack constraints

- No new dependencies without asking first.
- Colour, radius, and type tokens live only in `src/tokens.css`. No component hard-codes a colour or a one-off radius.
- Data lives in typed JSON files under `src/data/`, each with a validator in `src/data/guides-schema.js` (or its own `-schema.js`) that runs at build time via `scripts/validate-data.mjs`. A malformed file fails the build, not the page.
- Every route is prerendered (`scripts/prerender.mjs`) with route-specific `<title>` and meta so shared links unfurl without running JS.

## Copy

Cut hard. Plain verbs, sentence case. No filler ("really", "very", "actually", "simply", "just", "basically", "essentially"), no hedging, and no text that narrates the site's own structure ("start here", "this is where", "the whole site…"). State opinions; don't hedge them.
