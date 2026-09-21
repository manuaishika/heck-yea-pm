import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions, categories, categorySlug } from '../data/questions'
import { useReviews } from '../lib/useReviews'

/*
 * A plain SVG, laid out from the data: one hub per category on a ring, each
 * hub's questions as dots around it. Filled = you have marked it in
 * flashcards, hollow = not yet. No physics, no library: positions are a fixed
 * function of the bank, so it renders immediately and scales as one image.
 */

const W = 520
// crop the empty margin so the picture is as large as possible on a phone
const VIEW = '60 15 400 480'
const CX = W / 2
const CY = 250
const RING = 150 // hub distance from the centre
const HUB_R = 19
const DOT_R = 3.4
const GOLDEN = 2.39996 // radians: even sunflower packing

function layout() {
  return categories.map((cat, k) => {
    const angle = -Math.PI / 2 + (k * 2 * Math.PI) / categories.length
    const hx = CX + RING * Math.cos(angle)
    const hy = CY + RING * Math.sin(angle)
    const qs = questions.filter((q) => q.category === cat)
    const dots = qs.map((q, i) => {
      const r = 22 + 6.2 * Math.sqrt(i)
      const a = i * GOLDEN
      return { id: q.id, x: hx + r * Math.cos(a), y: hy + r * Math.sin(a) }
    })
    const reach = 22 + 6.2 * Math.sqrt(Math.max(qs.length - 1, 0)) + DOT_R + 4
    const above = hy < CY + 1 // labels sit outside the cluster, away from the middle
    return {
      cat,
      slug: categorySlug(cat),
      hx,
      hy,
      dots,
      reach,
      labelY: above ? hy - reach - 4 : hy + reach + 14,
    }
  })
}

export default function CategoryGraph() {
  const navigate = useNavigate()
  const { marks } = useReviews()
  const [active, setActive] = useState(null)
  const pointer = useRef('mouse') // last pointer type: touch has no hover
  const hubs = useMemo(layout, [])

  const reviewed = (id) => Boolean(marks[id])
  const totalReviewed = questions.filter((q) => reviewed(q.id)).length
  const on = hubs.find((h) => h.cat === active)

  function open(hub) {
    // touch has no hover: the first tap highlights, the second opens
    const touch = pointer.current === 'touch' || window.matchMedia('(hover: none)').matches
    if (touch && active !== hub.cat) {
      setActive(hub.cat)
      return
    }
    navigate(`/browse?category=${hub.slug}`)
  }

  const caption = on
    ? `${on.cat.toLowerCase()} · ${on.dots.filter((d) => reviewed(d.id)).length} of ${on.dots.length} reviewed`
    : `${totalReviewed} of ${questions.length} reviewed · ● = done`

  return (
    <figure className="m-0">
      <svg
        viewBox={VIEW}
        role="group"
        aria-label="The question bank by category. Each dot is a question; filled dots are ones you have reviewed."
        className="mx-auto block h-auto w-full max-w-[440px]"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setActive(null) // tap on empty space clears
        }}
      >
        <circle cx={CX} cy={CY} r={RING} fill="none" stroke="var(--border)" strokeWidth="1" />

        {hubs.map((h) => {
          const dim = active !== null && active !== h.cat
          return (
            <a
              key={h.cat}
              href={`/browse?category=${h.slug}`}
              data-cat={h.slug}
              className="graph-hub"
              aria-label={`${h.cat}, ${h.dots.length} questions, ${h.dots.filter((d) => reviewed(d.id)).length} reviewed`}
              onPointerDown={(e) => {
                pointer.current = e.pointerType
              }}
              onClick={(e) => {
                e.preventDefault()
                open(h)
              }}
              onMouseEnter={() => pointer.current !== 'touch' && setActive(h.cat)}
              onMouseLeave={() => pointer.current !== 'touch' && setActive(null)}
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(h.cat)}
              onBlur={() => setActive(null)}
              style={{ opacity: dim ? 0.2 : 1 }}
            >
              {/* generous hit area: the whole cluster */}
              <circle cx={h.hx} cy={h.hy} r={h.reach} fill="transparent" />
              {h.dots.map((d) => (
                <circle
                  key={d.id}
                  cx={d.x}
                  cy={d.y}
                  r={DOT_R}
                  strokeWidth="1.4"
                  style={{
                    fill: reviewed(d.id) ? 'var(--c)' : 'var(--surface)',
                    stroke: 'var(--c)',
                  }}
                />
              ))}
              <circle cx={h.hx} cy={h.hy} r={HUB_R} style={{ fill: 'var(--c)' }} />
              <text
                x={h.hx}
                y={h.hy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontWeight="600"
                style={{ fill: 'var(--surface)' }}
              >
                {h.dots.length}
              </text>
              <text
                x={h.hx}
                y={h.labelY}
                textAnchor="middle"
                fontSize="18"
                fontWeight="600"
                style={{ fill: 'var(--c)' }}
              >
                {h.cat}
              </text>
            </a>
          )
        })}
      </svg>
      <figcaption className="mt-2 text-center font-mono text-text-muted" aria-live="polite">
        {caption}
      </figcaption>
    </figure>
  )
}
