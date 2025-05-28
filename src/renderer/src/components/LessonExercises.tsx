import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

interface Lesson {
  id: number
  title: string
  description: string
  level: string
  category: string
}

interface Exercise {
  id: number
  lesson_id: number
  title: string
  description: string
  difficulty: string
  type: string
}

const LessonExercises: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lessonId) {
      loadLessonExercises()
    }
  }, [lessonId])

  const loadLessonExercises = async (): Promise<void> => {
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

      // Get exercises for this lesson
      const exercisesResult = await window.electron.ipcRenderer.invoke(
        'get-exercises',
        parseInt(lessonId!)
      )
      if (!exercisesResult.success) {
        throw new Error(exercisesResult.error)
      }
      setExercises(exercisesResult.exercises)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = (): void => {
    if (lesson?.level) {
      navigate(`/level/${lesson.level.toLowerCase()}`)
    } else {
      navigate(-1)
    }
  }

  const getDifficultyBadgeColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'badge-success'
      case 'medium':
        return 'badge-warning'
      case 'hard':
        return 'badge-error'
      default:
        return 'badge-neutral'
    }
  }

  if (loading) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
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

  return (
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

      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Exercises for: {lesson.title}</h1>

      {/* Lesson Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Lesson Information</h2>
        <p className="text-gray-600 leading-relaxed mb-4">{lesson.description}</p>

        <div className="flex gap-2">
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

        <div className="mt-4">
          <Link to={`/lesson/${lesson.id}`} className="btn btn-outline btn-sm">
            View Lesson Content
          </Link>
        </div>
      </div>

      {/* Exercises */}
      {exercises.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Available Exercises ({exercises.length})
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="card bg-base-100 shadow-lg border border-gray-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{exercise.title}</h3>

                  {exercise.description && (
                    <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                  )}

                  {/* Exercise badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exercise.difficulty && (
                      <span
                        className={`badge ${getDifficultyBadgeColor(exercise.difficulty)} badge-sm`}
                      >
                        {exercise.difficulty}
                      </span>
                    )}
                    {exercise.type && (
                      <span className="badge badge-outline badge-sm">{exercise.type}</span>
                    )}
                  </div>

                  <div className="card-actions justify-end">
                    <Link to={`/exercise/${exercise.id}`} className="btn btn-primary btn-sm">
                      Start Exercise
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>No exercises available for this lesson yet.</span>
          </div>

          <div className="mt-4">
            <Link to={`/lesson/${lesson.id}`} className="btn btn-primary">
              Study the Lesson First
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default LessonExercises
