import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-6xl font-bold mb-3">404</h1>
        <p className="text-gray-300 mb-8">That page does not exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
