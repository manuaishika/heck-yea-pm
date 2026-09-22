import { useRef, useState } from 'react'

/**
 * The homepage demo: autoplays muted and loops, with a visible pause
 * control (autoplaying video always needs one). Recorded by
 * scripts/record-demo.js into public/demo/.
 */
export default function DemoVideo() {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(true)

  function toggle() {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-panel border border-border">
      <video
        ref={ref}
        className="block w-full"
        autoPlay
        muted
        loop
        playsInline
        poster="/demo/poster.jpg"
      >
        <source src="/demo/demo.webm" type="video/webm" />
        <source src="/demo/demo.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause demo' : 'Play demo'}
        className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-pill border border-border bg-surface text-text shadow-soft"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="3" y="2" width="4" height="12" fill="currentColor" />
            <rect x="9" y="2" width="4" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 2l11 6-11 6V2Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  )
}
