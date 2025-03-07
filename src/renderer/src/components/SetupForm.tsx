import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SetupForm(): JSX.Element {
  const [username, setUsername] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (): Promise<void> => {
    if (!username.trim()) return

    // Save to database using IPC
    await window.electron.ipcRenderer.invoke('save-username', username)

    // Update UI state
    setIsSubmitted(true)
  }

  const goToDashboard = (): void => {
    navigate('/dashboard')
  }

  return (
    <>
      <div
        className={`card lg:card-side bg-base-100 shadow-xl animate-[fadeIn_0.3s_ease-in-out] ${isSubmitted ? 'hidden' : ''}`}
      >
        <div className="card-body">
          <h2 className="card-title">Welcome! Let&apos;s set up your profile</h2>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Setup your username</span>
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="input input-bordered w-full max-w-xs"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={handleSubmit}>
              Continue
            </button>
          </div>
        </div>
      </div>

      <div
        className={`card lg:card-side bg-base-100 shadow-xl animate-[fadeIn_0.3s_ease-in-out] ${isSubmitted ? '' : 'hidden'}`}
      >
        <div className="card-body">
          <h2 className="card-title">Welcome {username}, let&apos;s get started!</h2>
          <p>Your profile has been saved successfully.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={goToDashboard}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
