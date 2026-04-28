import { Link } from 'react-router-dom'

function Flashcards() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Flashcards</h1>
        <p className="text-gray-300 mb-8">
          Flashcard mode is being wired up. For now, use Browse mode to study all questions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/browse"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Go to Browse
          </Link>
          <Link
            to="/flashcards/complete"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
          >
            Mark Session Complete
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Flashcards
