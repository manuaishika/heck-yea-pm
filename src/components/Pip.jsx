const MOODS = ['happy', 'curious', 'thinking', 'excited', 'focused', 'encouraging', 'oops', 'celebrating']

/**
 * Pip, the site mascot — public/mascot/<mood>.webp. Appears only on: the
 * flowchart practice step, empty states, coach marks, and flashcard
 * completion/milestones. Never on the homepage.
 */
export default function Pip({ mood = 'happy', size = 64, className = '' }) {
  const src = MOODS.includes(mood) ? `/mascot/${mood}.webp` : '/mascot/happy.webp'
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`logo-plate ${className}`.trim()}
      style={{ width: size, height: 'auto' }}
    />
  )
}
