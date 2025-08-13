import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import SetupForm from './components/SetupForm'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Options from './components/Options'
import Exercises from './components/Exercises'
import ExercisePage from './components/ExercisePage'
import LessonExercises from './components/LessonExercises'
import About from './components/About'
import Dictionary from './components/Dictionary'
import Lessons from './components/Lessons'
import AllLessons from './components/AllLessons'
import LevelLessons from './components/LevelLessons'
import CategoryLessons from './components/CategoryLessons'
import LessonPage from './components/LessonPage'
import Profile from './components/Profile'
import DonateButton from './components/DonateButton'
import KanaStudyMain from './components/kana-study/KanaStudyMain'

// This component determines whether to show the navbar based on the current route
const AppContent = (): JSX.Element => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')
  const showNavbar = !['/', '/setup'].includes(location.pathname)
  const showWelcomeText = ['/', '/setup'].includes(location.pathname)
  const showDonate = !['/', '/setup'].includes(location.pathname)

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut')
      setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('fadeIn')
      }, 200) // This should match half of your CSS transition duration
    }
  }, [location, displayLocation])

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      {showNavbar && <Navbar />}
      {showDonate && <DonateButton />}
      <div className="flex flex-col items-center justify-center flex-grow">
        {showWelcomeText && (
          <>
            <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
            <p className="text-lg mb-8">This is the opensource version!</p>
          </>
        )}

        <div
          className={`transition-opacity duration-400 ease-in-out ${transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'}`}
        >
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kana-lesson" element={<KanaStudyMain />} />
            <Route path="/options" element={<Options />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
            <Route path="/lesson-exercises/:lessonId" element={<LessonExercises />} />
            <Route path="/about" element={<About />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/all-lessons" element={<AllLessons />} />
            <Route path="/level/:level" element={<LevelLessons />} />
            <Route path="/category/:category" element={<CategoryLessons />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/profile" element={<Profile />} />
            {/* Catch all other routes and redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

// This is a wrapper component that forces the initial route to be the homepage
const ForceHomepageWrapper = (): JSX.Element => {
  const location = useLocation()

  // If this is the initial load and we're not at the homepage, redirect
  if (location.pathname !== '/' && location.key === 'default') {
    console.log('ForceHomepageWrapper: Redirecting to homepage')
    return <Navigate to="/" replace />
  }

  return <AppContent />
}

export default function App(): JSX.Element {
  return (
    <HashRouter>
      <ForceHomepageWrapper />
    </HashRouter>
  )
}
