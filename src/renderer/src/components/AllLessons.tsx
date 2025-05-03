import React, { useState, useEffect } from 'react'
import { Lesson, Exercise } from '../types/database'
import { useNavigate } from 'react-router-dom'

const AllLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<Record<number, Exercise[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        setLoading(true)
        const result = await window.electron.ipcRenderer.invoke('get-all-lessons')
        if (result.success) {
          setLessons(result.data)

          // Fetch exercises for each lesson
          const exercisesByLesson: Record<number, Exercise[]> = {}
          for (const lesson of result.data) {
            const exercisesResult = await window.electron.ipcRenderer.invoke(
              'get-exercises-by-lesson',
              lesson.id
            )
            if (exercisesResult.success) {
              exercisesByLesson[lesson.id] = exercisesResult.data
            }
          }
          setExercises(exercisesByLesson)
        } else {
          setError(result.error || 'Failed to fetch lessons')
        }
      } catch (err) {
        setError('An error occurred while fetching lessons')
      } finally {
        setLoading(false)
      }
    }
    fetchLessons()
  }, [])

  // Group lessons by level
  const getLessonsByLevel = () => {
    const grouped: Record<string, Lesson[]> = {}

    lessons.forEach((lesson) => {
      const level = lesson.level || 'Uncategorized'
      if (!grouped[level]) {
        grouped[level] = []
      }
      grouped[level].push(lesson)
    })

    // Sort each group by order_index
    Object.keys(grouped).forEach((level) => {
      grouped[level].sort((a, b) => {
        const orderA = a.order_index !== null ? a.order_index : Infinity
        const orderB = b.order_index !== null ? b.order_index : Infinity
        return orderA - orderB
      })
    })

    return grouped
  }

  const handleLessonClick = (lessonId: number): void => {
    navigate(`/lesson/${lessonId}`)
  }
  const handleExerciseClick = (exerciseId: number): void => {
    navigate(`/exercise/${exerciseId}`)
  }

  const lessonsByLevel = getLessonsByLevel()
  const levels = Object.keys(lessonsByLevel).sort((a, b) => {
    const levelOrder: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Uncategorized: 4
    }
    return (levelOrder[a] || 5) - (levelOrder[b] || 5)
  })

  if (loading) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 flex justify-center items-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24">
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
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">All Lessons</h1>

      {lessons.length === 0 ? (
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
          <span>No lessons found. Start by adding lessons in the admin panel.</span>
        </div>
      ) : (
        <div className="space-y-12">
          {levels.map((level) => (
            <div key={level} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-primary">
                {level} Level
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonsByLevel[level].map((lesson) => (
                  <div
                    key={lesson.id}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <div className="card-body">
                      <h3 className="card-title text-xl">{lesson.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {lesson.category && (
                          <span className="badge badge-primary">{lesson.category}</span>
                        )}
                        <span className="badge badge-outline">{level}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{lesson.description}</p>

                      <div className="card-actions justify-between mt-auto">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleLessonClick(lesson.id)}
                        >
                          Lesson
                        </button>

                        {exercises[lesson.id] && exercises[lesson.id].length > 0 ? (
                          <div className="dropdown dropdown-top dropdown-end">
                            <label tabIndex={0} className="btn">
                              Exercises
                            </label>
                            <ul
                              tabIndex={0}
                              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                            >
                              {exercises[lesson.id].map((exercise) => (
                                <li key={exercise.id}>
                                  <a onClick={() => handleExerciseClick(exercise.id)}>
                                    {exercise.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <button className="btn btn-disabled">No Exercises</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllLessons
