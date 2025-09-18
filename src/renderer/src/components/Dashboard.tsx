import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useEffect, useState } from 'react'
import Joyride, { Step, STATUS, ACTIONS, CallBackProps } from 'react-joyride'
import img1 from '../assets/images/img1.svg'
import img2 from '../assets/images/img2.svg'
import img3 from '../assets/images/img3.svg'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(): JSX.Element {
  const [username, setUsername] = useState('User')
  const [userLevel, setUserLevel] = useState<number | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [runTour, setRunTour] = useState(false)

  // Define the onboarding tour steps
  const tourSteps: Step[] = [
    {
      target: '.dashboard-greeting',
      content:
        'Welcome to JapanoLearn! This is your personal dashboard where you can track your progress and access all learning features.',
      placement: 'bottom',
      disableBeacon: true
    },
    {
      target: '[data-tour="lessons"]',
      content:
        'Start your Japanese learning journey here! Access structured lessons covering hiragana, katakana, and basic vocabulary.',
      placement: 'bottom',
      disableBeacon: true
    },
    {
      target: '[data-tour="kana-lesson"]',
      content:
        'Learn the Japanese writing systems - Hiragana and Katakana - with interactive lessons and audio pronunciation.',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '[data-tour="dictionary"]',
      content:
        'Look up Japanese words and phrases in our comprehensive dictionary. Perfect for expanding your vocabulary!',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '[data-tour="exercises"]',
      content: 'Test your knowledge with various exercises and quizzes. Practice makes perfect!',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '[data-tour="profile"]',
      content:
        "Track your learning progress, view your stats, and see how far you've come in your Japanese journey.",
      placement: 'top',
      disableBeacon: true
    }
  ]

  useEffect(() => {
    async function fetchUserProfile(): Promise<void> {
      try {
        const userId = 1 // For now, hardcoded to match ProfilePage
        const result = await window.electron.ipcRenderer.invoke('get-user-profile', userId)
        if (result.success && result.profile) {
          setUsername(result.profile.username)
          setUserLevel(result.profile.level || 1)
        }
      } catch (err) {
        // Optionally handle error
        setUsername('User')
        setUserLevel(1)
      }
    }

    async function checkOnboardingStatus(): Promise<void> {
      try {
        const userId = 1 // For now, hardcoded to match ProfilePage
        const result = await window.electron.ipcRenderer.invoke('get-onboarding-status', userId)
        if (result.success && !result.completed) {
          setShowOnboarding(true)
          setRunTour(true)
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err)
      }
    }

    // Development keyboard shortcut to reset onboarding (Cmd+Shift+O on Mac, Ctrl+Shift+O on others)
    const handleKeyPress = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'O') {
        resetOnboarding()
      }
    }

    fetchUserProfile()
    checkOnboardingStatus()
    document.addEventListener('keydown', handleKeyPress)

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  // Addding navigation to the dashboard
  const navigate = useNavigate()

  // Handle Joyride callback
  const handleJoyrideCallback = async (data: CallBackProps): Promise<void> => {
    const { status, action } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      setRunTour(false)
      // Mark onboarding as completed
      try {
        const userId = 1
        await window.electron.ipcRenderer.invoke('complete-onboarding', userId)
        setShowOnboarding(false)
      } catch (err) {
        console.error('Error completing onboarding:', err)
      }
    }
  }

  // New function to navigate to Dashboard

  const goToAllLessons = (): void => {
    navigate('/all-lessons')
  }
  const goToExercises = (): void => {
    navigate('/exercises')
  }

  const goToDictionary = (): void => {
    navigate('/dictionary')
  }

  const goToProfile = (): void => {
    navigate('/profile')
  }

  const goToKanaLesson = (): void => {
    navigate('/kana-lesson')
  }

  // Development-only function to reset onboarding (remove in production)
  const resetOnboarding = async (): Promise<void> => {
    try {
      const userId = 1
      await window.electron.ipcRenderer.invoke('reset-onboarding', userId)
      setShowOnboarding(true)
      setRunTour(true)
    } catch (err) {
      console.error('Error resetting onboarding:', err)
    }
  }

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/*Greeting */}
      <div className="dashboard-greeting">
        <h1 className="text-4xl font-bold mb-4">Welcome to Japanolearn</h1>
        <div className="flex items-center gap-4 mt-4">
          <p className="text-lg">Hello, {username}!</p>
          {userLevel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Level {userLevel}
            </span>
          )}
        </div>
      </div>

      {/* Masonry Layout */}
      <div className="mt-6">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter="16px">
            {/* Lesson Card */}
            {/* Lesson Card with Background Image */}
            <div
              className="
              relative
              bg-blue-200
              rounded-lg
              p-5
              h-64
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              w-full
              "
              onClick={goToAllLessons}
              data-tour="lessons"
              style={{
                backgroundImage: `url(${img1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              {/* Content positioned above the overlay */}
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-blue-800">Lessons</h2>
                <p className="mt-2 text-blue-700">Get Started with Japanese lessons!</p>
                <div className="mt-3 text-blue-600">
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">あ</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">い</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1 mr-1">う</span>
                  <span className="inline-block bg-blue-100 rounded px-2 py-1">え</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl z-10">あ</div>
            </div>

            {/* Katakana Card */}
            <div
              className="
              relative 
              bg-green-200 
              rounded-lg 
              p-5
              w-full
              h-60 
              cursor-pointer 
              transition-shadow 
              duration-300 
              ease-in-out 
              hover:shadow-2xl
              "
              onClick={goToKanaLesson}
              data-tour="kana-lesson"
            >
              <h2 className="text-lg font-bold text-green-800">Learn Hiragana and Katakana</h2>
              <p className="mt-2 text-green-700">
                Learn the two syllabaries of the Japanese language through interactive lessons.
              </p>
              <div className="absolute bottom-4 right-4 text-4xl">カ</div>
              <div className="mt-3 text-green-600">
                <span className="inline-block bg-green-100 rounded px-2 py-1 mr-1">いぬ</span>
                <span className="inline-block bg-green-100 rounded px-2 py-1 mr-1">パン</span>
              </div>
            </div>

            {/* Kanji Card */}
            <div
              className="
              relative
              bg-purple-200
              rounded-lg
              p-5
              w-full
              h-64
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
              onClick={goToDictionary}
              data-tour="dictionary"
              style={{
                backgroundImage: `url(${img2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              <div className="relative z-10">
                <h2 className="text-lg font-bold text-purple-800">Dictionary</h2>
                <p className="mt-2 text-purple-700">
                  Discover and learn Japanese words and Phrases.
                </p>

                <div className="mt-3 text-purple-600">
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">人</span>
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">日</span>
                  <span className="inline-block bg-purple-100 rounded px-2 py-1 mr-1">月</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl">水</div>
            </div>

            {/* Vocabulary Card */}
            <div
              className="
              relative
              bg-red-200
              rounded-lg
              p-5
              w-full
              h-60
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
            >
              <h2 className="text-lg font-bold text-red-800">Vocabulary Builder</h2>
              <p className="mt-2 text-red-700">
                Expand your Japanese vocabulary with common words and phrases.
              </p>
              <div className="mt-3 text-red-600">
                <span className="inline-block bg-red-100 rounded px-2 py-1 mr-1">こんにちは</span>
                <span className="inline-block bg-red-100 rounded px-2 py-1 mr-1">ありがとう</span>
                <span className="inline-block bg-red-100 rounded px-2 py-1">さようなら</span>
              </div>
            </div>

            {/* Grammar Card */}
            <div
              className="
              relative
              bg-amber-200
              rounded-lg
              p-5
              w-full
              h-72
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
              onClick={goToExercises}
              data-tour="exercises"
              style={{
                backgroundImage: `url(${img3})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg"></div>

              <div className="relative z-10">
                <h2 className="text-lg font-bold text-black-800">Exercises</h2>
                <p className="mt-2 text-black-700">
                  Practice what you have learnt in different quizzes!
                </p>
                <div className="mt-3 text-black-600">
                  <p className="bg-gray-100 rounded p-2 mb-2">わたしは__を読みます。</p>
                  <p className="bg-gray-100 rounded p-2">日本語__勉強しています。</p>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div
              className="
              relative
              bg-teal-200
              rounded-lg
              p-5
              w-full
              h-68
              cursor-pointer
              transition-shadow
              duration-300
              ease-in-out
              hover:shadow-2xl
              "
              onClick={goToProfile}
              data-tour="profile"
            >
              <h2 className="text-lg font-bold text-teal-800">Profile</h2>
              <p className="mt-2 text-teal-700">Check your stats, level and progress</p>
              <div className="mt-3 text-teal-600">
                <span className="inline-block bg-teal-100 rounded px-2 py-1 mr-1">Level 5</span>
                <span className="inline-block bg-teal-100 rounded px-2 py-1 mr-1">
                  85% Progress
                </span>
                <span className="inline-block bg-teal-100 rounded px-2 py-1">Stats</span>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl">👤</div>
            </div>
          </Masonry>
        </ResponsiveMasonry>
      </div>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose
          hideCloseButton
          spotlightClicks
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#3b82f6',
              backgroundColor: '#ffffff',
              textColor: '#374151',
              overlayColor: 'rgba(0, 0, 0, 0.4)',
              arrowColor: '#ffffff',
              zIndex: 1000,
              beaconSize: 0 // This effectively hides the beacon
            }
          }}
          locale={{
            back: 'Back',
            close: 'Close',
            last: 'Finish Tour',
            next: 'Next',
            skip: 'Skip Tour'
          }}
        />
      )}
    </div>
  )
}
