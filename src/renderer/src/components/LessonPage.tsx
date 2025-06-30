import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import YouTube, { YouTubeProps } from 'react-youtube'
import LessonProgressDrawer from './LessonProgressDrawer'

// Add this function at the top of the file, outside the component
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // Create script element with HTTPS URL
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true

    // Set up the callback
    window.onYouTubeIframeAPIReady = (): void => {
      resolve()
    }

    document.head.appendChild(script)
  })
}

// Add proper type declarations for YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YouTubeProps) => YouTubePlayer
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

// YouTube Player interface
interface YouTubePlayer {
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
}

interface Lesson {
  id: number
  title: string
  description: string
  explanation: string
  video_url: string
  level: string
  category: string
  order_index: number
}

interface LessonQuestion {
  id: number
  lesson_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
  image_path: string | null
}

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<LessonQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({})

  // New state for video progress tracking
  const [videoProgress, setVideoProgress] = useState(0) // 0-50 for video progress
  const [quizProgress, setQuizProgress] = useState(0) // 0-50 for quiz progress
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoWatchTime, setVideoWatchTime] = useState(0)
  const [youtubeAPIReady, setYoutubeAPIReady] = useState(false)

  useEffect(() => {
    // Load YouTube API first
    loadYouTubeAPI().then(() => {
      setYoutubeAPIReady(true)
    })
  }, [])

  useEffect(() => {
    if (lessonId && youtubeAPIReady) {
      loadLessonData()
    }
  }, [lessonId, youtubeAPIReady])

  const loadLessonData = async (): Promise<void> => {
    try {
      setLoading(true)

      // Get all lessons and find the specific one
      const lessonsResult = await window.electron.ipcRenderer.invoke('get-lessons')
      if (!lessonsResult.success) {
        throw new Error(lessonsResult.error)
      }

      const currentLesson = lessonsResult.lessons.find((l: Lesson) => l.id === parseInt(lessonId!))
      if (!currentLesson) {
        throw new Error('Lesson not found')
      }
      setLesson(currentLesson)

      // Get lesson questions
      const questionsResult = await window.electron.ipcRenderer.invoke(
        'get-lesson-questions',
        parseInt(lessonId!)
      )
      if (!questionsResult.success) {
        throw new Error(questionsResult.error)
      }
      setQuestions(questionsResult.questions)

      // Load image URLs for questions that have images
      const imageUrlPromises = questionsResult.questions
        .filter((q: LessonQuestion) => q.image_path)
        .map(async (q: LessonQuestion) => {
          const imageUrl = await window.electron.ipcRenderer.invoke(
            'get-secure-image-url',
            q.image_path
          )
          return { questionId: q.id, url: imageUrl }
        })

      const imageResults = await Promise.all(imageUrlPromises)
      const imageUrlMap: { [key: number]: string } = {}
      imageResults.forEach(({ questionId, url }) => {
        imageUrlMap[questionId] = url
      })
      setImageUrls(imageUrlMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, answer: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = (): void => {
    setShowResults(true)
    // Calculate quiz progress based on completion
    setQuizProgress(50) // Full quiz progress when submitted
  }

  const resetQuiz = (): void => {
    setSelectedAnswers({})
    setShowResults(false)
    setQuizProgress(0) // Reset quiz progress
  }

  const handleBackClick = (): void => {
    if (lesson?.level) {
      navigate(`/level/${lesson.level.toLowerCase()}`)
    } else {
      navigate(-1) // Fallback to browser back
    }
  }

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return ''

    // Handle different YouTube URL formats
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    )
    return videoIdMatch ? videoIdMatch[1] : ''
  }

  // YouTube player event handlers
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const duration = event.target.getDuration()
    setVideoDuration(duration)
    console.log('Video ready, duration:', duration)
  }

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    const playerState = event.data
    console.log('Player state changed:', playerState)

    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (playerState === 1) {
      // Playing
      startProgressTracking(event.target)
    }
  }

  const startProgressTracking = (player: YouTubePlayer): void => {
    const trackProgress = (): void => {
      if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime()
        const duration = player.getDuration()

        if (duration > 0) {
          const watchPercentage = (currentTime / duration) * 100
          setVideoWatchTime(currentTime)

          // Update video progress (0-50 based on 80% completion)
          if (watchPercentage >= 80) {
            setVideoProgress(50) // Full video progress at 80%
          } else {
            setVideoProgress((watchPercentage / 80) * 50) // Scale to 50 max
          }
        }
      }
    }

    // Track progress every second while playing
    const interval = setInterval(() => {
      if (player.getPlayerState() === 1) {
        // Still playing
        trackProgress()
      } else {
        clearInterval(interval)
      }
    }, 1000)

    // Clean up interval after 10 seconds (will restart when playing again)
    setTimeout(() => clearInterval(interval), 10000)
  }

  const onPlayerError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube player error:', event.data)
  }

  // YouTube player options
  const youtubeOpts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1
    }
  }

  const calculateScore = (): { correct: number; total: number } => {
    let correct = 0
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        correct++
      }
    })
    return { correct, total: questions.length }
  }

  if (loading || !youtubeAPIReady) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading lesson...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="text-xl">Lesson not found</div>
      </div>
    )
  }

  const score = showResults ? calculateScore() : null
  const videoId = getYouTubeVideoId(lesson.video_url)

  return (
    <div className="drawer drawer-end">
      <input id="lesson-progress-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content">
        {/* Progress Tab Button - positioned below drawer when open */}
        <label
          htmlFor="lesson-progress-drawer"
          className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30 cursor-pointer"
        >
          <div className="bg-blue-600 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors flex flex-col items-center gap-2 min-w-[60px]">
            <span className="text-2xl">💻</span>
            <div className="text-xs font-medium text-center leading-tight">
              <div>Progress</div>
              <div className="font-bold">{Math.round(videoProgress + quizProgress)}%</div>
            </div>
          </div>
        </label>

        {/* Page Content */}
        <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
          {/* Back button */}
          <div className="mb-4">
            <button onClick={handleBackClick} className="btn btn-outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to {lesson.level} Lessons
            </button>
          </div>

          {/* Lesson Title */}
          <h1 className="text-4xl font-bold mb-6 text-gray-800">{lesson.title}</h1>

          {/* Lesson Description */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Description</h2>
            <p className="text-gray-600 leading-relaxed">{lesson.description}</p>

            {/* Level and Category badges */}
            <div className="flex gap-2 mt-4">
              {lesson.level && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Level: {lesson.level}
                </span>
              )}
              {lesson.category && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {lesson.category}
                </span>
              )}
            </div>
          </div>

          {/* YouTube Video */}
          {lesson.video_url && videoId && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Video Lesson</h2>
              <div className="aspect-video">
                <YouTube
                  videoId={videoId}
                  opts={youtubeOpts}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  onError={onPlayerError}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Lesson Explanation - Simple HTML Display */}
          {lesson.explanation && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Explanation</h2>
              <div
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.explanation }}
              />
            </div>
          )}

          {/* Lesson Questions */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Practice Questions</h2>
                {showResults && score && (
                  <div className="text-lg font-semibold">
                    Score: {score.correct}/{score.total} (
                    {Math.round((score.correct / score.total) * 100)}%)
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">
                      {index + 1}. {question.question}
                    </h3>

                    {/* Question Image */}
                    {question.image_path && imageUrls[question.id] && (
                      <div className="mb-4">
                        <img
                          src={imageUrls[question.id]}
                          alt="Question illustration"
                          className="max-w-md max-h-64 object-contain rounded-lg border border-gray-300"
                        />
                      </div>
                    )}

                    {/* Answer Options */}
                    <div className="space-y-2">
                      {[
                        { key: 'A', value: question.option_a },
                        { key: 'B', value: question.option_b },
                        { key: 'C', value: question.option_c },
                        { key: 'D', value: question.option_d }
                      ]
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => {
                          const isSelected = selectedAnswers[question.id] === option.key
                          const isCorrect = option.key === question.correct_answer
                          const isWrong = showResults && isSelected && !isCorrect
                          const shouldHighlight = showResults && isCorrect

                          return (
                            <label
                              key={option.key}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                showResults
                                  ? shouldHighlight
                                    ? 'bg-green-100 border-green-500 text-green-800'
                                    : isWrong
                                      ? 'bg-red-100 border-red-500 text-red-800'
                                      : 'bg-gray-50 border-gray-300'
                                  : isSelected
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.key}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(question.id, option.key)}
                                disabled={showResults}
                                className="mr-3"
                              />
                              <span className="font-medium mr-2">{option.key}.</span>
                              <span>{option.value}</span>
                            </label>
                          )
                        })}
                    </div>

                    {/* Show explanation after submission */}
                    {showResults && question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quiz Controls */}
              <div className="mt-6 flex gap-4">
                {!showResults ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={resetQuiz}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="lesson-progress-drawer" className="drawer-overlay"></label>
        <LessonProgressDrawer
          lesson={{
            id: lesson.id,
            title: lesson.title,
            level: lesson.level
          }}
          videoProgress={videoProgress}
          quizProgress={quizProgress}
          videoDuration={videoDuration}
          videoWatchTime={videoWatchTime}
          questions={questions}
          selectedAnswers={selectedAnswers}
          showResults={showResults}
          score={score}
          onBackClick={handleBackClick}
        />
      </div>
    </div>
  )
}

export default LessonPage
