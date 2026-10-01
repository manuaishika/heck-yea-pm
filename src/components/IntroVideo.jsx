import { useRef, useState } from 'react'

/**
 * The homepage intro: 30 seconds on how to get into product. Autoplays muted
 * and loops, with a visible pause control (autoplaying video always needs
 * one). Rendered by scripts/intro-video/render.mjs into public/intro/.
 */
export default function IntroVideo() {
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
    <div className="relative overflow-hidden border border-ink">
      <video
        ref={ref}
        className="block aspect-video w-full"
        autoPlay
        muted
        loop
        playsInline
        poster="/intro/poster.jpg"
        aria-label="How to get into product management, in 30 seconds: know the job, build the skills, show proof, apply where freshers get in, crack the loop."
      >
        <source src="/intro/intro.webm" type="video/webm" />
        <source src="/intro/intro.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-pill border border-ink bg-surface text-text"
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
