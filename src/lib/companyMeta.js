import { companies } from '../data/guides'

/**
 * Presentation-only company metadata: where each company's logo lives (saved
 * in /public/logos) and its own site. Keyed by the display name used in
 * companies.json and in the questions' `companies` tags. A company with no
 * `logo` shows as a name-only tag.
 *
 * Logos are the companies' own favicons, saved once from Google's favicon
 * service so pages don't call out to it.
 */
const BRANDS = {
  Google: { logo: 'google', url: 'https://www.google.com' },
  Microsoft: { logo: 'microsoft', url: 'https://www.microsoft.com' },
  Amazon: { logo: 'amazon', url: 'https://www.amazon.com' },
  Meta: { logo: 'meta', url: 'https://about.meta.com' },
  Flipkart: { logo: 'flipkart', url: 'https://www.flipkart.com' },
  Zomato: { logo: 'zomato', url: 'https://www.zomato.com' },
  Swiggy: { logo: 'swiggy', url: 'https://www.swiggy.com' },
  Razorpay: { logo: 'razorpay', url: 'https://razorpay.com' },
  Zepto: { logo: 'zepto', url: 'https://www.zeptonow.com' },
  Meesho: { logo: 'meesho', url: 'https://www.meesho.com' },
  Spotify: { logo: 'spotify', url: 'https://www.spotify.com' },
  X: { logo: 'x', url: 'https://x.com' },
  Ola: { logo: null, url: 'https://www.olacabs.com' },
}

/** @returns {{ logo: string | null, url: string } | null} */
export function brandFor(name) {
  return BRANDS[name] ?? null
}

export function logoSrc(brand) {
  return brand?.logo ? `/logos/${brand.logo}.png` : null
}

const LEVEL = { light: 0, medium: 1, heavy: 2 }

/** For each category, the weight most companies give it (ties go lighter). */
const typical = (() => {
  const tally = {}
  for (const c of companies) {
    for (const [cat, level] of c.weights) {
      tally[cat] ??= [0, 0, 0]
      tally[cat][LEVEL[level]] += 1
    }
  }
  const out = {}
  for (const [cat, counts] of Object.entries(tally)) {
    let best = 0
    counts.forEach((n, i) => {
      if (n > counts[best]) best = i
    })
    out[cat] = best
  }
  return out
})()

/**
 * Categories a company weights *more* than most companies do — the ones worth
 * a star. Derived from the existing weights, nothing stored.
 *
 * @param {{ weights: [string, 'heavy'|'medium'|'light'][] }} company
 * @returns {string[]}
 */
export function standoutsFor(company) {
  return company.weights
    .filter(([cat, level]) => LEVEL[level] > typical[cat])
    .map(([cat]) => cat)
}
