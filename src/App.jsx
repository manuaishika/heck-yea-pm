import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Browse from './pages/Browse'
import QuestionDetail from './pages/QuestionDetail'
import Flashcards from './pages/Flashcards'
import FlashcardsComplete from './pages/FlashcardsComplete'
import About from './pages/About'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-navy-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/browse/:questionId" element={<QuestionDetail />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/flashcards/complete" element={<FlashcardsComplete />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
