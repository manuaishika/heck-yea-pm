// After `vite build`, write a static HTML file per route with route-specific
// <title> and social meta, so links pasted into WhatsApp / Slack unfurl
// correctly without running JS. The SPA still hydrates and takes over routing.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const dataDir = join(root, 'src', 'data')
const ORIGIN = process.env.SITE_ORIGIN || 'https://heck-yea-pm.vercel.app'
const SITE = 'Heck Yea PM'

const read = (f) => JSON.parse(readFileSync(join(dataDir, f), 'utf8'))
const questions = read('questions.json')
const companies = read('companies.json').companies
const methods = read('methods.json').methods

const clip = (s, n = 155) => s.replace(/\s+/g, ' ').trim().slice(0, n)

// static routes — kept in step with each page's useHead() call
const routes = {
  '/': {
    title: null,
    description:
      'Free prep for your first PM interview. The role, the skills, a question bank, and company loops — built for students applying to APM programs.',
  },
  '/role': {
    title: 'The role',
    description:
      'What a product manager actually does, and how the job changes between an early startup, a scaled startup, and a large company.',
  },
  '/careers': {
    title: 'Careers',
    description:
      'PM role types, how to break in without a PM background, how the job changes by company stage, the ladder, getting in from India, and who is hiring right now.',
  },
  '/guesstimates': {
    title: 'Guesstimates',
    description:
      'Guesstimate questions across population, non-tech products, and tech products, plus how to size something and explain a metric drop.',
  },
  '/resources': {
    title: 'Resources',
    description:
      'Newsletters, launch trackers, design references, and practice sites to build product taste before a PM interview.',
  },
  '/resume': {
    title: 'Resume',
    description:
      'What a PM intern resume needs when you have no PM experience: the bullet formula, what goes in each section, and a checklist.',
  },
  '/skills': {
    title: 'Skills',
    description:
      'The technical and non-technical skills a PM interview tests, what a good answer sounds like for each, and how deep you need to go.',
  },
  '/skills/assess': {
    title: 'Where do you stand?',
    description:
      'A 15-question quiz across the technical and non-technical PM skills, with a read on where you stand and what to fix first.',
  },
  '/browse': {
    title: 'Question bank',
    description:
      'Every PM intern interview question, filterable by category and keyword, each with a model answer and the mistake that sinks most candidates.',
  },
  '/companies': {
    title: 'Companies',
    description:
      'What the PM interview loop looks like at Google, Microsoft, Amazon, Meta, and the Indian APM programs — Flipkart, Zomato, Swiggy, Razorpay, Zepto, Meesho.',
  },
  '/flashcards': {
    title: 'Flashcards',
    description:
      'Study the PM question bank as flashcards. Mark each card known or needs review; your progress is saved on your device.',
  },
  '/methods': {
    title: 'Methods',
    description:
      'The answering frameworks PM candidates use: STAR, CIRCLES, North Star, AARRR, HEART, RICE, TAM/SAM/SOM and more, each with steps and a worked example.',
  },
  '/directory': {
    title: 'Index',
    description: 'Every question, method and company on the site, in one list — search or filter to find one fast.',
  },
  '/about': {
    title: 'About',
    description:
      'What this is, who made it, and how to contribute a question, a company loop, or a correction.',
  },
  '/ai': {
    title: 'AI in the PM interview',
    description:
      'How AI is showing up in the PM interview loop, and what changes in how you prep and answer.',
  },
  '/india': {
    title: 'Careers',
    description:
      'PM role types, how to break in without a PM background, how the job changes by company stage, the ladder, getting in from India, and who is hiring right now.',
  },
  '/flashcards/complete': {
    title: 'Flashcards — done',
    description:
      'You finished this flashcard set. Review what needs another pass, or start a new set.',
  },
  '/saved': {
    title: 'Saved questions',
    description: 'Questions you saved from the bank, kept on your device or synced to your account.',
  },
  '/login': {
    title: 'Log in',
    description: 'Sign in to sync your saved questions and flashcard progress across devices.',
  },
}

for (const q of questions) {
  const answer =
    q.sections.find((s) => /answer/i.test(s.label)) ||
    q.sections[q.sections.length - 1]
  routes[`/browse/${q.id}`] = {
    title: clip(q.question, 70),
    description: clip((answer?.points || []).join('. ') || q.question),
  }
}
for (const m of methods) {
  routes[`/methods/${m.slug}`] = {
    title: `${m.name} — answering method`,
    description: clip(`${m.when} Steps, a worked example, and the common failure.`),
  }
}
for (const c of companies) {
  routes[`/companies/${c.slug}`] = {
    title: `${c.name} PM interview`,
    description: clip(`${c.name}: ${c.rounds.length}-round ${c.program} loop. ${c.format}`),
  }
}

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function render(path, { title, description }) {
  const fullTitle = title ? `${esc(title)} — ${SITE}` : `${SITE} — PM intern interview prep`
  const desc = esc(description)
  const url = ORIGIN + path
  const metaContent = (attr, name, value) =>
    new RegExp(`(<meta ${attr}="${name}"[^>]*content=")[^"]*(")`)
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${fullTitle}</title>`)
    .replace(metaContent('name', 'description'), `$1${desc}$2`)
    .replace(metaContent('property', 'og:title'), `$1${fullTitle}$2`)
    .replace(metaContent('property', 'og:description'), `$1${desc}$2`)
    .replace(
      '</head>',
      `  <meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />\n  </head>`
    )
  return html
}

let count = 0
for (const [path, meta] of Object.entries(routes)) {
  const html = render(path, meta)
  if (path === '/') {
    writeFileSync(join(dist, 'index.html'), html)
  } else {
    const file = join(dist, `${path.slice(1)}.html`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, html)
  }
  count += 1
}

console.log(`✓ prerendered ${count} routes`)
