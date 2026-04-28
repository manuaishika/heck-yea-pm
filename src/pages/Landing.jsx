import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { questions, categories } from '../data/questions'

function Landing() {
  const [isVisible, setIsVisible] = useState({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const categoryCounts = useMemo(() => {
    const counts = {}
    for (const q of questions) {
      const catId = q.category.toLowerCase().replace(/\s+/g, '-')
      counts[catId] = (counts[catId] || 0) + 1
    }
    return counts
  }, [])

  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Startups']

  return (
    <div className="w-full">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full glow"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Crack your PM interview.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            {questions.length} questions. Real answers. Built for FAANG interns.
          </motion.p>

          <div className="mt-6 mb-10 max-w-2xl mx-auto px-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-white">Interview rule:</span> Only talk about
                products you use at least weekly. Depth beats impressiveness: bring 3 real pain
                points and 3 specific improvements.
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/browse"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
            >
              Browse Questions →
            </Link>
            <Link
              to="/flashcards"
              className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 backdrop-blur-sm"
            >
              Try Flashcards
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <svg
              className="w-6 h-6 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
      </section>

      <section className="bg-navy-950/50 border-y border-white/5 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...companies, ...companies].map((company, idx) => (
            <div key={idx} className="flex items-center mx-8">
              <span className="text-gray-400 text-sm font-medium">
                Questions sourced from {company}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            id="how-it-works"
            data-animate
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible['how-it-works'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three steps to ace your interview</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Pick a category',
                description: 'Choose from Product Strategy, Metrics, Technical, and more',
                icon: '🎯',
              },
              {
                step: '2',
                title: 'Read or flip',
                description: 'Browse detailed answers or use flashcard mode for quick review',
                icon: '📚',
              },
              {
                step: '3',
                title: 'Ace the interview',
                description: 'Walk into your PM interview with confidence and preparation',
                icon: '🚀',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                id={`step-${idx}`}
                data-animate
                initial={{ opacity: 0, y: 40 }}
                animate={isVisible[`step-${idx}`] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-blue-500 font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-navy-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            id="features"
            data-animate
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible['features'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Two Ways to Learn</h2>
            <p className="text-xl text-gray-400">Choose the mode that fits your study style</p>
          </motion.div>

          <div className="space-y-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                id="browse-preview"
                data-animate
                initial={{ opacity: 0, x: -40 }}
                animate={isVisible['browse-preview'] ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-400">Browse Mode Preview</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={isVisible['browse-preview'] ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-3xl font-bold mb-4">Browse Mode</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Explore all 58 questions organized by category. Read detailed answers, take notes,
                  and search for specific topics. Perfect for deep learning sessions.
                </p>
                <Link
                  to="/browse"
                  className="inline-flex items-center text-blue-500 hover:text-blue-400 font-semibold"
                >
                  Try Browse Mode →
                </Link>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isVisible['flashcard-preview'] ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="order-2 md:order-1"
              >
                <h3 className="text-3xl font-bold mb-4">Flashcard Mode</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Quick review with interactive flashcards. Flip to reveal answers, mark questions as
                  reviewed, and track your progress. Ideal for last-minute prep.
                </p>
                <Link
                  to="/flashcards"
                  className="inline-flex items-center text-blue-500 hover:text-blue-400 font-semibold"
                >
                  Try Flashcard Mode →
                </Link>
              </motion.div>

              <motion.div
                id="flashcard-preview"
                data-animate
                initial={{ opacity: 0, x: 40 }}
                animate={isVisible['flashcard-preview'] ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="order-1 md:order-2"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🃏</div>
                    <p className="text-gray-400">Flashcard Mode Preview</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            id="categories"
            data-animate
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible['categories'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Explore by Category</h2>
            <p className="text-xl text-gray-400">
              {questions.length} questions across {categories.length} key areas
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, idx) => (
              <motion.button
                key={idx}
                id={`category-${idx}`}
                data-animate
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible[`category-${idx}`] ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {categoryCounts[category.name.toLowerCase().replace(/\s+/g, '-')] || 0} questions
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            id="cta"
            data-animate
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible['cta'] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Start prepping. Your interview won't wait.
            </h2>
            <Link
              to="/browse"
              className="inline-block px-10 py-5 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl"
            >
              Get Started →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing
