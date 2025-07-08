import React, { useEffect, useState } from 'react'

interface LessonProgressDrawerProps {
  lesson: {
    id: number
    title: string
    level: string
  }
  videoProgress: number // 0-50
  quizProgress: number // 0-50
  videoDuration: number
  videoWatchTime: number
  questions: Array<{ id: number }>
  selectedAnswers: { [key: number]: string }
  showResults: boolean
  score: { correct: number; total: number } | null
  onBackClick: () => void
}

const LessonProgressDrawer: React.FC<LessonProgressDrawerProps> = ({
  lesson,
  videoProgress: propVideoProgress,
  quizProgress: propQuizProgress,
  videoDuration,
  videoWatchTime,
  questions,
  selectedAnswers,
  showResults,
  score,
  onBackClick
}) => {
  // State for persisted progress
  const [persisted, setPersisted] = useState<{
    video_progress: number
    quiz_progress: number
    overall_progress: number
  } | null>(null)

  // Fetch persisted progress on mount or when lesson changes
  useEffect(() => {
    async function fetchPersistedProgress(): Promise<void> {
      try {
        const userResult = await window.electron.ipcRenderer.invoke('get-users')
        if (userResult.success && userResult.users && userResult.users.length > 0) {
          const uid = userResult.users[0].id
          const progressResult = await window.electron.ipcRenderer.invoke(
            'get-user-lesson-progress',
            {
              userId: uid,
              lessonId: lesson.id
            }
          )
          if (progressResult.success && progressResult.progress) {
            setPersisted(progressResult.progress)
          } else {
            setPersisted(null)
          }
        }
      } catch {
        setPersisted(null)
      }
    }
    fetchPersistedProgress()
  }, [lesson.id])

  // Use persisted values if available, else fallback to props
  const videoProgress = persisted ? persisted.video_progress : propVideoProgress
  const quizProgress = persisted ? persisted.quiz_progress : propQuizProgress
  const totalProgress = persisted
    ? persisted.overall_progress
    : Math.round(propVideoProgress + propQuizProgress)

  return (
    <div className="min-h-full w-80 bg-white shadow-xl">
      {/* Drawer Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Lesson Progress</h3>
          <label
            htmlFor="lesson-progress-drawer"
            className="btn btn-sm btn-circle btn-ghost text-white"
          >
            ✕
          </label>
        </div>
        <p className="text-blue-100 text-sm mt-2">{lesson.title}</p>
      </div>

      {/* Progress Content */}
      <div className="p-6 space-y-6">
        {/* Overall Progress Circle */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="radial-progress text-blue-600 text-6xl font-bold"
              style={
                {
                  '--value': totalProgress,
                  '--size': '12rem',
                  '--thickness': '8px'
                } as React.CSSProperties
              }
              role="progressbar"
            >
              {totalProgress}%
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">Overall Lesson Progress</p>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-4">
          <div className="divider">Progress Breakdown</div>

          {/* Video Progress */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">📹 Video Lesson</span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(videoProgress)}/50
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(videoProgress / 50) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Watch Time: {Math.round(videoWatchTime)}s</span>
              <span>Duration: {Math.round(videoDuration)}s</span>
            </div>
            {videoProgress >= 50 ? (
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <span className="mr-1">✅</span>
                Video completed!
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-2">
                Watch 80% of the video to complete this section
              </div>
            )}
          </div>

          {/* Quiz Progress */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">❓ Practice Quiz</span>
              <span className="text-sm font-bold text-green-600">
                {Math.round(quizProgress)}/50
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(quizProgress / 50) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Questions: {questions.length}</span>
              <span>Answered: {Object.keys(selectedAnswers).length}</span>
            </div>
            {showResults && score ? (
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <span className="mr-1">✅</span>
                Quiz completed! Score: {score.correct}/{score.total}
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-2">
                Complete the practice questions to finish this section
              </div>
            )}
          </div>
        </div>

        {/* Completion Status */}
        {totalProgress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎉</span>
              <div>
                <h4 className="font-bold text-green-800">Lesson Complete!</h4>
                <p className="text-sm text-green-600">Great job finishing this lesson!</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {totalProgress < 100 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                {videoProgress < 50 && <li>• Watch the video lesson</li>}
                {quizProgress < 50 && <li>• Complete the practice questions</li>}
              </ul>
            </div>
          )}

          <button onClick={onBackClick} className="w-full btn btn-outline">
            Back to Lessons
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonProgressDrawer
