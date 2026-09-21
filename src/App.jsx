import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollManager from './components/ScrollManager'
import { Page } from './components/Page'
import Landing from './pages/Landing'
import { AuthProvider } from './lib/auth'

const Role = lazy(() => import('./pages/Role'))
const Skills = lazy(() => import('./pages/Skills'))
const Assess = lazy(() => import('./pages/Assess'))
const Careers = lazy(() => import('./pages/Careers'))
const India = lazy(() => import('./pages/India'))
const Guesstimates = lazy(() => import('./pages/Guesstimates'))
const Resume = lazy(() => import('./pages/Resume'))
const Resources = lazy(() => import('./pages/Resources'))
const Methods = lazy(() => import('./pages/Methods'))
const MethodDetail = lazy(() => import('./pages/MethodDetail'))
const Browse = lazy(() => import('./pages/Browse'))
const QuestionDetail = lazy(() => import('./pages/QuestionDetail'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const FlashcardsComplete = lazy(() => import('./pages/FlashcardsComplete'))
const About = lazy(() => import('./pages/About'))
const Saved = lazy(() => import('./pages/Saved'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

const fallback = (
  <Page>
    <p className="label">Loading…</p>
  </Page>
)

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <ScrollManager />
      <Suspense fallback={fallback}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="role" element={<Role />} />
            <Route path="skills" element={<Skills />} />
            <Route path="skills/assess" element={<Assess />} />
            <Route path="careers" element={<Careers />} />
            <Route path="india" element={<India />} />
            <Route path="guesstimates" element={<Guesstimates />} />
            <Route path="resume" element={<Resume />} />
            <Route path="resources" element={<Resources />} />
            <Route path="methods" element={<Methods />} />
            <Route path="methods/:slug" element={<MethodDetail />} />
            <Route path="browse" element={<Browse />} />
            <Route path="browse/:id" element={<QuestionDetail />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:slug" element={<CompanyDetail />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="flashcards/complete" element={<FlashcardsComplete />} />
            <Route path="saved" element={<Saved />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </AuthProvider>
  )
}
