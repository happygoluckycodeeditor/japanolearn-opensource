import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './components/HomePage'
import SetupForm from './components/SetupForm'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'

// This component determines whether to show the navbar based on the current route
const AppContent = (): JSX.Element => {
  const location = useLocation()
  const showNavbar = !['/', '/setup'].includes(location.pathname)
  // Add this new condition to only show welcome text on specific routes
  const showWelcomeText = ['/', '/setup'].includes(location.pathname)

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

        <div className="transition-all duration-300 ease-in-out">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<SetupForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
