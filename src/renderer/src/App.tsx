import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import SetupForm from './components/SetupForm'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Options from './components/Options'

// This component determines whether to show the navbar based on the current route
const AppContent = (): JSX.Element => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')
  const showNavbar = !['/', '/setup'].includes(location.pathname)
  const showWelcomeText = ['/', '/setup'].includes(location.pathname)

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
    <div className="flex flex-col h-screen bg-gray-200">
      {showNavbar && <Navbar />}
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
            <Route path="/options" element={<Options />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
