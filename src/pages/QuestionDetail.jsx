import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { questions } from '../data/questions'
import ReactMarkdown from 'react-markdown'

function QuestionDetail() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const question = questions.find((q) => q.id === parseInt(questionId))

  if (!question) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Question not found</h2>
          <Link to="/browse" className="text-blue-500 hover:text-blue-400">
            ← Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  const relatedQuestionsData = question.relatedQuestions
    ? questions.filter((q) => question.relatedQuestions.includes(q.id))
    : []

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Browse
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            {question.category}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            {question.question}
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-6 mb-4">{children}</h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
                      {children}
                    </ol>
                  ),
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="bg-white/10 px-2 py-1 rounded text-blue-400 text-sm">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto mb-4">
                        <code className="text-sm text-gray-300">{children}</code>
                      </pre>
                    ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-white/20 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-white/10">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left border-b border-white/20 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border-b border-white/20 text-gray-300">
                      {children}
                    </td>
                  ),
                }}
              >
                {question.answer}
              </ReactMarkdown>
            </div>
          </div>

          {question.tip && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Pro Tip</h4>
                  <p className="text-gray-300">{question.tip}</p>
                </div>
              </div>
            </div>
          )}

          {relatedQuestionsData.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Related Questions</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedQuestionsData.map((related) => (
                  <Link
                    key={related.id}
                    to={`/browse/${related.id}`}
                    className="block bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-xs text-blue-400 font-medium mb-2 block">
                      {related.category}
                    </span>
                    <h4 className="font-semibold group-hover:text-blue-400 transition-colors">
                      {related.question}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default QuestionDetail
