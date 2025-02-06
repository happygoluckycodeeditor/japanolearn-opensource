import { useState } from 'react'
import logo from './assets/images/logo.svg'
import SetupForm from './components/SetupForm'

export default function App(): JSX.Element {
  const [showSetup, setShowSetup] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
      <p className="text-lg mb-8">This is the opensource version!</p>

      <div className="transition-all duration-300 ease-in-out">
        {!showSetup ? (
          <div
            className="card lg:card-side bg-base-100 shadow-xl
                       transform transition-all duration-300 ease-in-out
                       hover:scale-[1.01]"
          >
            <figure>
              <img src={logo} alt="Album" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Let&apos;s get you learning Japanese!</h2>
              <p>Click the button to get started</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => setShowSetup(true)}>
                  Get Started
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="transform transition-all duration-300 ease-in-out
                       animate-[fadeIn_0.3s_ease-in-out]"
          >
            <SetupForm />
          </div>
        )}
      </div>
    </div>
  )
}
