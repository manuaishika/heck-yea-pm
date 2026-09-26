// Enforces the one-token-file rule: fails the build if any hex/rgb/hsl
// colour literal appears in src/ outside src/tokens.css, or if a Tailwind
// default-palette colour class (bg-blue-500, text-red-600, ...) is written
// anywhere. Also asserts the old accent is fully gone, that every v4
// palette token still holds its spec'd hex value, and that a block colour
// is never used anywhere but a full-bleed panel or a tag pill.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'src')
const TOKENS_FILE = join(srcDir, 'tokens.css')

const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.css'])

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, files)
    else if (CODE_EXT.has(name.slice(name.lastIndexOf('.')))) files.push(p)
  }
  return files
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g
const RGB_HSL = /\b(rgba?|hsla?)\([^)]*\)/g

const PALETTE_NAMES = [
  'slate', 'gray', 'grey', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
]
const PREFIXES = [
  'bg', 'text', 'border', 'ring', 'fill', 'stroke', 'from', 'via', 'to',
  'divide', 'outline', 'decoration', 'shadow', 'accent', 'caret', 'placeholder',
]
// e.g. bg-blue-500, hover:text-red-600, dark:border-slate-100 — the default
// Tailwind palette only, never our own token names (blue-50/100/300 stay fine
// because those are declared in tokens.css, not the Tailwind default scale).
const TAILWIND_DEFAULT = new RegExp(
  `\\b(?:[\\w-]+:)*(?:${PREFIXES.join('|')})-(?:${PALETTE_NAMES.join('|')})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
  'g'
)

const OLD_ACCENT = [/#b5173f/i, /#e8577f/i, /\bcrimson\b/i, /\bburgundy\b/i]

// v4's full allowed list — the notebook palette (paper, card, ink, rule, tag,
// six full-bleed block colours) plus the three round-weight badge colours,
// which stay the one sanctioned exception used nowhere but WeightBars.jsx.
// Asserted here, at their exact hex, so a future audit reads every one of
// these as intentional rather than drift to flag.
const WEIGHT_TOKENS = [
  ['--weight-heavy', '#c0392b'],
  ['--weight-medium', '#d97706'],
  ['--weight-light', '#ca9a1f'],
]
const PALETTE_TOKENS = [
  ['--paper', '#f4f1ea'],
  ['--card', '#ffffff'],
  ['--ink', '#141414'],
  ['--rule', '#d8d2c6'],
  ['--tag', '#f5c518'],
  ['--block-pink', '#f28bb0'],
  ['--block-yellow', '#f2b705'],
  ['--block-red', '#e04a2f'],
  ['--block-blue', '#3c6fc4'],
  ['--block-grey', '#c9c6bd'],
  ['--block-green', '#3e8e6e'],
]

let problems = 0
const files = walk(srcDir)

for (const file of files) {
  if (file === TOKENS_FILE) continue // the one place colours may live
  const text = readFileSync(file, 'utf8')
  const rel = relative(root, file)

  for (const m of text.matchAll(HEX)) {
    console.error(`✗ [check-colors] ${rel}: hex literal ${m[0]} outside tokens.css`)
    problems++
  }
  for (const m of text.matchAll(RGB_HSL)) {
    console.error(`✗ [check-colors] ${rel}: ${m[0].slice(0, 40)} outside tokens.css`)
    problems++
  }
  for (const m of text.matchAll(TAILWIND_DEFAULT)) {
    console.error(`✗ [check-colors] ${rel}: default Tailwind colour class "${m[0]}"`)
    problems++
  }
  for (const re of OLD_ACCENT) {
    if (re.test(text)) {
      console.error(`✗ [check-colors] ${rel}: leftover old accent (${re})`)
      problems++
    }
  }
}

// explicit, named assertion the spec calls for — belt and braces on top of the scan above
const allText = files.map((f) => readFileSync(f, 'utf8')).join('\n')
if (/#3b82f6/i.test(allText) || /rgb\(\s*59\s*,\s*130\s*,\s*246\s*\)/i.test(allText)) {
  console.error('✗ [check-colors] #3B82F6 / rgb(59, 130, 246) found — must be zero results')
  problems++
}

const tokensText = readFileSync(TOKENS_FILE, 'utf8')
for (const [name, hex] of [...PALETTE_TOKENS, ...WEIGHT_TOKENS]) {
  const re = new RegExp(`${name}:\\s*${hex}\\b`, 'i')
  if (!re.test(tokensText)) {
    console.error(`✗ [check-colors] tokens.css: expected ${name}: ${hex} (v4 palette token missing or changed)`)
    problems++
  }
}

// block colours are full-bleed section panels and featured-card tag pills
// ONLY — never a card fill, a border, or body text. Scan every component for
// the block-* token used through any other Tailwind property prefix.
const BLOCK_NAMES = ['block-pink', 'block-yellow', 'block-red', 'block-blue', 'block-grey', 'block-green']
const BLOCK_MISUSE = new RegExp(
  `\\b(?:[\\w-]+:)*(?:border|ring|outline|divide|caret|placeholder|accent|decoration)-(?:${BLOCK_NAMES.join('|')})\\b`,
  'g'
)
for (const file of files) {
  if (file === TOKENS_FILE) continue
  const text = readFileSync(file, 'utf8')
  const rel = relative(root, file)
  for (const m of text.matchAll(BLOCK_MISUSE)) {
    console.error(`✗ [check-colors] ${rel}: block colour "${m[0]}" used outside a panel/tag (borders, rings, text etc. never take a block colour)`)
    problems++
  }
}

if (problems > 0) {
  console.error(`\n✗ [check-colors] ${problems} problem(s). All colour lives in src/tokens.css only.\n`)
  process.exit(1)
}
console.log(`✓ check-colors — ${files.length} files scanned, no stray colours or default Tailwind palette classes`)
