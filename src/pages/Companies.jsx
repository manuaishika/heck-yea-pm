import { Link } from 'react-router-dom'
import { companies, companiesNote } from '../data/guides'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

export default function Companies() {
  useHead({
    title: 'Companies',
    description:
      'What the PM interview loop looks like at Google, Microsoft, Amazon, Meta, and the Indian APM programs — Flipkart, Zomato, Swiggy, Razorpay, Zepto, Meesho.',
    path: '/companies',
  })

  return (
    <Page>
      <PageHead
        chapter="Chapter 4"
        title="Companies"
        intro="What each loop looks like — how many rounds, what format, what they weight."
      />

      <p className="prose-body mt-4 border-l-4 border-accent pl-3">
        {companiesNote}
      </p>

      <ul className="mt-5 border-t border-rule">
        {companies.map((c) => (
          <li key={c.slug} className="border-b border-rule">
            <Link
              to={`/companies/${c.slug}`}
              className="block py-3 no-underline"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-md text-ink">{c.name}</span>
                <span className="label shrink-0">{c.region}</span>
              </div>
              <span className="prose-body mt-0.5 block">
                {c.program} · {c.rounds.length} rounds
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  )
}
