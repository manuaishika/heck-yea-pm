import { companies } from '../data/guides'

/**
 * Presentation-only company metadata: where each company's logo lives (saved
 * in /public/logos) and its own site. Keyed by the display name used in
 * companies.json and in the questions' `companies` tags. A company with no
 * `logo` shows its name instead.
 *
 * The .png logos are the companies' own favicons, saved once from Google's
 * favicon service. The .svg ones are from Simple Icons (CC0), filled with
 * each brand's own colour.
 */
const BRANDS = {
  Google: { logo: 'google.png', url: 'https://www.google.com' },
  Microsoft: { logo: 'microsoft.png', url: 'https://www.microsoft.com' },
  Amazon: { logo: 'amazon.png', url: 'https://www.amazon.com' },
  Meta: { logo: 'meta.png', url: 'https://about.meta.com' },
  Flipkart: { logo: 'flipkart.png', url: 'https://www.flipkart.com' },
  Zomato: { logo: 'zomato.png', url: 'https://www.zomato.com' },
  Swiggy: { logo: 'swiggy.png', url: 'https://www.swiggy.com' },
  Razorpay: { logo: 'razorpay.png', url: 'https://razorpay.com' },
  Zepto: { logo: 'zepto.png', url: 'https://www.zeptonow.com' },
  Meesho: { logo: 'meesho.png', url: 'https://www.meesho.com' },
  Spotify: { logo: 'spotify.png', url: 'https://www.spotify.com' },
  X: { logo: 'x.png', url: 'https://x.com' },
  Ola: { logo: null, url: 'https://www.olacabs.com' },
  Uber: { logo: 'uber.svg', url: 'https://www.uber.com' },
  Airbnb: { logo: 'airbnb.svg', url: 'https://www.airbnb.com' },
  'Booking.com': { logo: 'bookingdotcom.svg', url: 'https://www.booking.com' },
  CRED: { logo: null, url: 'https://cred.club' },
  PhonePe: { logo: 'phonepe.svg', url: 'https://www.phonepe.com' },
  Paytm: { logo: 'paytm.svg', url: 'https://paytm.com' },
  Groww: { logo: null, url: 'https://groww.in' },
  Zerodha: { logo: 'zerodha.svg', url: 'https://zerodha.com' },
  'HDFC Bank': { logo: 'hdfcbank.svg', url: 'https://www.hdfcbank.com' },
  'ICICI Bank': { logo: 'icicibank.svg', url: 'https://www.icicibank.com' },
  'Axis Bank': { logo: 'axisbank.svg', url: 'https://www.axisbank.com' },
  Freshworks: { logo: null, url: 'https://www.freshworks.com' },
  Zoho: { logo: 'zoho.svg', url: 'https://www.zoho.com' },
  Atlassian: { logo: 'atlassian.svg', url: 'https://www.atlassian.com' },
  Salesforce: { logo: 'salesforce.svg', url: 'https://www.salesforce.com' },
  Adobe: { logo: 'adobe.svg', url: 'https://www.adobe.com' },
  Intuit: { logo: 'intuit.svg', url: 'https://www.intuit.com' },
  Sprinklr: { logo: null, url: 'https://www.sprinklr.com' },
  "BYJU'S": { logo: 'byjus.svg', url: 'https://byjus.com' },
  PharmEasy: { logo: null, url: 'https://pharmeasy.in' },
  'Tata 1mg': { logo: null, url: 'https://www.1mg.com' },
  Dream11: { logo: null, url: 'https://www.dream11.com' },
  Games24x7: { logo: null, url: 'https://www.games24x7.com' },
  'Reliance Jio': { logo: 'jio.svg', url: 'https://www.jio.com' },
  Airtel: { logo: 'airtel.svg', url: 'https://www.airtel.in' },
}

/** @returns {{ logo: string | null, url: string } | null} */
export function brandFor(name) {
  return BRANDS[name] ?? null
}

export function logoSrc(brand) {
  return brand?.logo ? `/logos/${brand.logo}` : null
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
