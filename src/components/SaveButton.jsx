import { useSaved } from '../lib/useSaved'

function Bookmark({ filled }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M3 1.5h6a.5.5 0 0 1 .5.5v9L6 8.9 2.5 11V2a.5.5 0 0 1 .5-.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** @param {{ id: string, question: string, withLabel?: boolean }} props */
export default function SaveButton({ id, question, withLabel = false }) {
  const { isSaved, toggleSave } = useSaved()
  const saved = isSaved(id)

  return (
    <button
      type="button"
      onClick={() => toggleSave(id)}
      aria-pressed={saved}
      aria-label={saved ? `Remove "${question}" from saved` : `Save "${question}"`}
      className={`label inline-flex items-center gap-1.5 border px-1.5 py-1 transition-colors ${
        saved
          ? 'border-accent text-accent'
          : 'border-rule hover:border-rule-hard hover:text-ink'
      }`}
    >
      <Bookmark filled={saved} />
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
