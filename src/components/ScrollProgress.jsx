import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

/** A thin scroll-progress bar in the accent colour, fixed to the top of the page. */
export default function ScrollProgress() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const spring = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 })

  if (reduce) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: spring }}
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-accent"
    />
  )
}
