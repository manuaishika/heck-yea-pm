/**
 * The filling bar inside one progress segment, driven by CSS rather than
 * per-frame state. Pass the same `run` key useAutoStep returns so it
 * restarts in step; `playing` pauses it in place.
 */
export default function ProgressFill({ run, ms, playing, className = 'bg-ink' }) {
  return (
    <span
      key={run}
      className={`progress-fill block h-full ${className}`}
      style={{ animationDuration: `${ms}ms`, animationPlayState: playing ? 'running' : 'paused' }}
    />
  )
}
