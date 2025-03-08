import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/images/logo.svg'

export default function HomePage(): JSX.Element {
  const navigate = useNavigate()
  const [hasExistingUser, setHasExistingUser] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function checkExistingUser(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('get-users')

      if (result.success && result.users && result.users.length > 0) {
        setHasExistingUser(true)
        setUsername(result.users[0].username)
      }
    }

    checkExistingUser()
  }, [])

  const handleGetStarted = (): void => {
    // Add a fade-out class first
    document.getElementById('home-card')?.classList.add('animate-[fadeOut_0.3s_ease-in-out]')
    // Navigate after animation
    setTimeout(() => {
      if (hasExistingUser) {
        navigate('/dashboard')
      } else {
        navigate('/setup')
      }
    }, 300)
  }

  return (
    <div
      id="home-card"
      className="card lg:card-side bg-base-100 shadow-xl
                 transform transition-all duration-300 ease-in-out
                 hover:scale-[1.01] animate-[fadeIn_0.3s_ease-in-out]"
    >
      <figure>
        <img src={logo} alt="Album" />
      </figure>
      <div className="card-body">
        {hasExistingUser ? (
          <>
            <h2 className="card-title">Welcome back, {username}!</h2>
            <p>Continue your Japanese learning journey</p>
          </>
        ) : (
          <>
            <h2 className="card-title">Let&apos;s get you learning Japanese!</h2>
            <p>Click the button to get started</p>
          </>
        )}
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={handleGetStarted}>
            {hasExistingUser ? 'Continue to Dashboard' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}
