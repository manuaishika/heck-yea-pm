import { useEffect, useRef, useState } from 'react'

/**
 * True once the element has been on screen (at `threshold`), and stays true.
 * Falls back to true where IntersectionObserver doesn't exist (prerender).
 */
export function useInView(threshold = 0.3) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

/**
 * A step index that advances by itself every `ms` while `running`, keeping
 * the unspent time across pauses. No per-frame state: pair it with
 * <ProgressFill>, a CSS animation keyed on `run`, which restarts whenever
 * the step changes or `jump` is called.
 */
export function useAutoStep(count, ms, running) {
  const [index, setIndex] = useState(0)
  const [run, setRun] = useState(0)
  const remaining = useRef(ms)

  useEffect(() => {
    remaining.current = ms
  }, [index, run, ms])

  useEffect(() => {
    if (!running) return undefined
    const started = Date.now()
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % count)
      setRun((r) => r + 1)
    }, remaining.current)
    return () => {
      clearTimeout(id)
      remaining.current -= Date.now() - started
    }
  }, [running, index, run, count, ms])

  function jump(i) {
    setIndex(i)
    setRun((r) => r + 1)
  }

  return [index, jump, run]
}

/** prefers-reduced-motion, read once on the client. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
