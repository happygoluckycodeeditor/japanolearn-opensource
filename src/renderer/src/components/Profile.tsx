import { useNavigate } from 'react-router-dom'
import ProfilePage from './profile/ProfilePage'

export default function Profile(): JSX.Element {
  const navigate = useNavigate()

  const goBack = (): void => {
    navigate('/Dashboard')
  }

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={goBack}
          className="mr-4 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <ProfilePage />
      </div>
    </div>
  )
}
