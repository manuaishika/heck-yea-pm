import { Link } from 'react-router-dom'

function FlashcardsComplete() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-4xl font-bold mb-3">Nice work.</h1>
        <p className="text-gray-300 mb-8">You completed a flashcard session.</p>
        <Link
          to="/flashcards"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Start Another Session
        </Link>
      </div>
    </div>
  )
}

export default FlashcardsComplete
