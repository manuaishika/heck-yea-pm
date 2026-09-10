import { useRef, useState } from 'react'

/**
 * A horizontal slide deck. Transform-based (not scroll) so it's reliable
 * everywhere. Swipe on touch, arrows / keyboard on desktop, dots for position.
 *
 * @param {{ children: React.ReactNode[], label?: string }} props
 */
export default function Slides({ children, label = 'Slides' }) {
  const [active, setActive] = useState(0)
  const touch = useRef(null)
  const count = children.length
  const go = (i) => setActive(Math.min(Math.max(i, 0), count - 1))

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(active - 1)
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="mt-3"
    >
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touch.current = e.changedTouches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (dx < -40) go(active + 1)
          else if (dx > 40) go(active - 1)
          touch.current = null
        }}
        className="overflow-hidden rounded-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div
          className="flex transition-transform duration-200 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {children.map((slide, i) => (
            <div
              key={i}
              aria-hidden={i !== active}
              className="w-full shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Previous slide"
          className="label px-2 py-1 disabled:opacity-30"
        >
          ‹ prev
        </button>

        <ol className="flex items-center gap-1.5" aria-hidden="true">
          {children.map((_, i) => (
            <li
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-4 bg-accent' : 'w-1.5 bg-rule'
              }`}
            />
          ))}
        </ol>

        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === count - 1}
          aria-label="Next slide"
          className="label px-2 py-1 disabled:opacity-30"
        >
          next ›
        </button>
      </div>
    </div>
  )
}
