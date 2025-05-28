import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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

const Exercises: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<{ [key: number]: Exercise[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExercisesData()
  }, [])

  const loadExercisesData = async (): Promise<void> => {
    try {
      setLoading(true)

      // Get all lessons
      const lessonsResult = await window.electron.ipcRenderer.invoke('get-lessons')
      if (!lessonsResult.success) {
        throw new Error(lessonsResult.error)
      }
      setLessons(lessonsResult.lessons)

      // Get exercises for each lesson
      const exercisePromises = lessonsResult.lessons.map(async (lesson: Lesson) => {
        const exercisesResult = await window.electron.ipcRenderer.invoke('get-exercises', lesson.id)
        return {
          lessonId: lesson.id,
          exercises: exercisesResult.success ? exercisesResult.exercises : []
        }
      })

      const exerciseResults = await Promise.all(exercisePromises)
      const exerciseMap: { [key: number]: Exercise[] } = {}
      exerciseResults.forEach(({ lessonId, exercises }) => {
        exerciseMap[lessonId] = exercises
      })
      setExercises(exerciseMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Group lessons by level
  const lessonsByLevel: Record<string, Lesson[]> = {}
  lessons.forEach((lesson) => {
    if (lesson.level) {
      if (!lessonsByLevel[lesson.level]) {
        lessonsByLevel[lesson.level] = []
      }
      lessonsByLevel[lesson.level].push(lesson)
    }
  })

  const getLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'text-primary'
      case 'intermediate':
        return 'text-secondary'
      case 'advanced':
        return 'text-accent'
      default:
        return 'text-primary'
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

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">Exercises</h1>
      <p className="text-lg mb-8 text-gray-600">
        Practice your Japanese skills with exercises organized by lesson and difficulty level.
      </p>

      {Object.entries(lessonsByLevel).length > 0 ? (
        Object.entries(lessonsByLevel).map(([level, levelLessons]) => (
          <div key={level} className="mb-10">
            <h2 className={`text-3xl font-bold mb-6 capitalize ${getLevelColor(level)}`}>
              {level} Level
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {levelLessons.map((lesson) => {
                const lessonExercises = exercises[lesson.id] || []

                return (
                  <div key={lesson.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title text-lg">{lesson.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>

                      {/* Lesson badges */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        <span className="badge badge-outline badge-sm">{lesson.level}</span>
                        {lesson.category && (
                          <span className="badge badge-outline badge-sm">{lesson.category}</span>
                        )}
                      </div>

                      {lessonExercises.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700">
                            Available Exercises ({lessonExercises.length}):
                          </h4>
                          {lessonExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium">{exercise.title}</span>
                                {exercise.difficulty && (
                                  <span
                                    className={`badge badge-xs ml-2 ${getDifficultyBadgeColor(exercise.difficulty)}`}
                                  >
                                    {exercise.difficulty}
                                  </span>
                                )}
                              </div>
                              <Link
                                to={`/exercise/${exercise.id}`}
                                className="btn btn-xs btn-primary"
                              >
                                Start
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No exercises available for this lesson yet.
                        </div>
                      )}

                      <div className="card-actions justify-end mt-4">
                        <Link to={`/lesson/${lesson.id}`} className="btn btn-outline btn-sm">
                          View Lesson
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      ) : (
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
          <span>No exercises available yet.</span>
        </div>
      )}
    </div>
  )
}

export default Exercises
