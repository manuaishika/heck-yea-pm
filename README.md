# Heck Yea PM

Free interview prep for a first product manager role — PM intern and
APM programs, including the Indian ones (Flipkart, Zomato, Swiggy, Razorpay,
Zepto, Meesho).

Four chapters — **the role**, **the skills** (with a self-assessment), a
**question bank**, and **company loops** — plus a flashcard study mode. All
content is static and bundled. No backend, no database, no auth. `localStorage`
holds review progress, saved questions, and assessment results, and nothing
leaves the browser.

## Develop

```
npm install
npm run dev        # vite dev server
npm run validate   # check every data file against its schema
npm run build      # validate → vite build → prerender per-route meta
npm run preview    # serve the production build locally
```

The build fails loudly if any data file is missing a field or has a duplicate
id. `npm run build` also writes a static HTML file per route (`dist/browse/<id>.html`,
`dist/companies/<slug>.html`, …) with route-specific `<title>` and Open Graph
tags so links unfurl in WhatsApp and Slack without running JS.

## Deploy

Pushes to the default branch deploy to Vercel as a static build. `vercel.json`
sets `cleanUrls` and rewrites unknown paths to `index.html` for client-side
routing; the prerendered files are served directly where they exist.

Set `SITE_ORIGIN` in the Vercel project (e.g. `https://heckyea.pm`) so the
prerendered `og:url` and canonical tags point at the real domain.

## Content

All content lives in typed JSON under `src/data/`, validated at build time by
`src/data/schema.js` (questions) and `src/data/guides-schema.js` (role, skills,
companies). Edit the JSON — never hard-code content in a component.

### Add a question — `src/data/questions.json`

```jsonc
{
  "id": "pricing-against-an-incumbent",   // stable slug, used in the URL — never change it
  "type": "question",
  "category": "Strategy",                 // Behavioral | Product Design | Strategy | Analytics | Technical | General
  "question": "How would you price against an entrenched incumbent?",
  "sections": [
    { "label": "Framework", "body": "1. …\n2. …" },   // markdown
    { "label": "Answer", "body": "…" }
  ],
  "tip": "One line on what the interviewer is really testing.",
  "failureMode": "The specific mistake that sinks most candidates here.",
  "companies": ["Flipkart"],              // may be []; names matched to company profiles
  "hard": true                            // true = a curveball, surfaced in its own filter
}
```

Behavioural questions use `Situation` / `Task` / `Action` / `Result` section
labels; everything else uses `Framework` / `Answer`. All fields are required
(`tip` and `companies` may be empty; `tip` must still be present as `""`).

### Add a company — `src/data/companies.json`

```jsonc
{
  "slug": "phonepe",
  "name": "PhonePe",
  "region": "India",
  "program": "APM",
  "verified": false,                      // flip to true once confirmed; drops the "unverified" banner
  "rounds": ["Recruiter call", "…"],
  "format": "One paragraph on how the interviews actually feel.",
  "weights": [                            // [category, "heavy" | "medium" | "light"]
    ["Product Design", "heavy"],
    ["Analytics", "medium"]
  ],
  "whatToKnow": "The one thing to prepare specifically for this company.",
  "questionTags": ["PhonePe"]             // question `companies` values that link here
}
```

### Add a skill — `src/data/skills.json`

Add to `technical.skills` or `nonTechnical.skills`:

```jsonc
{
  "slug": "experiment-design",
  "name": "Designing an experiment",
  "bankCategory": "Analytics",            // which question category to send the user to
  "whyPM": "Why a PM needs this.",
  "goodAnswer": "What a good answer sounds like.",
  "depth": "How deep is deep enough.",
  "assess": "A statement the user rates themselves against on /skills/assess."
}
```

### Edit the role guide — `src/data/role.json`

The startup-vs-MNC comparison is `modes.dimensions` (row labels) and
`modes.columns` (three modes, each with one `cells` entry per dimension). Keep
`cells` the same length as `dimensions` or the build fails.
