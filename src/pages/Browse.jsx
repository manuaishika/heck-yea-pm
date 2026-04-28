import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { questions, categories } from '../data/questions'

function Browse() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const categoryCounts = useMemo(() => {
    const counts = {}
    for (const q of questions) {
      const catId = q.category.toLowerCase().replace(/\s+/g, '-')
      counts[catId] = (counts[catId] || 0) + 1
    }
    return counts
  }, [])

  const filteredQuestions = useMemo(() => {
    let filtered = questions

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((q) => 
        q.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Browse Questions</h1>
          <p className="text-xl text-gray-400">
            {questions.length} questions across {categories.length} categories
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Questions
          </button>
          {categories.map((cat) => {
            const catId = cat.name.toLowerCase().replace(/\s+/g, '-')
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(catId)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === catId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name} <span className="text-gray-500">({categoryCounts[catId] || 0})</span>
              </button>
            )
          })}
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No questions found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
              >
                <Link
                  to={`/browse/${q.id}`}
                  className="block p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium mb-3">
                        {q.category}
                      </span>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400">
                        {q.question}
                      </h3>
                      <p className="text-gray-400 line-clamp-2">
                        {q.answer.substring(0, 150)}...
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse
