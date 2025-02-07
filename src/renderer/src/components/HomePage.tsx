import { useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo.svg'

export default function HomePage(): JSX.Element {
  const navigate = useNavigate()

  const handleGetStarted = (): void => {
    // Add a fade-out class first
    document.getElementById('home-card')?.classList.add('animate-[fadeOut_0.3s_ease-in-out]')
    // Navigate after animation
    setTimeout(() => navigate('/setup'), 300)
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
        <h2 className="card-title">Let&apos;s get you learning Japanese!</h2>
        <p>Click the button to get started</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}
