import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lesson } from '../types/database'

const CategoryLessons: React.FC = () => {
  const { category } = useParams<{ category: string }>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        const result = await window.electron.ipcRenderer.invoke('get-lessons')
        if (result.success) {
          // Filter lessons by the current category (case-insensitive)
          const filteredLessons = result.lessons.filter(
            (lesson: Lesson) => lesson.category?.toLowerCase() === category?.toLowerCase()
          )
          setLessons(filteredLessons)
        } else {
          setError(result.error || 'Failed to fetch lessons')
        }
      } catch (error) {
        setError('An error occurred while fetching lessons')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [category])

  // Group lessons by level
  const lessonsByLevel: Record<string, Lesson[]> = {
    beginner: [],
    intermediate: [],
    advanced: []
  }

  lessons.forEach((lesson) => {
    if (lesson.level) {
      const level = lesson.level.toLowerCase()
      if (level === 'beginner' || level === 'intermediate' || level === 'advanced') {
        lessonsByLevel[level].push(lesson)
      }
    }
  })

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
      {/* Back button */}
      <div className="mb-4">
        <Link to="/all-lessons" className="btn btn-outline">
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
          Back to All Lessons
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 capitalize">{category} Lessons</h1>

      {lessons.length > 0 ? (
        <>
          {/* Beginner Lessons */}
          {lessonsByLevel.beginner.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-primary">Beginner</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lessonsByLevel.beginner.map((lesson) => (
                  <div key={lesson.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{lesson.title}</h2>
                      <p>{lesson.description}</p>
                      <div className="card-actions justify-end mt-4">
                        <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                          Start
                        </Link>
                        <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                          Exercise
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intermediate Lessons */}
          {lessonsByLevel.intermediate.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-secondary">Intermediate</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lessonsByLevel.intermediate.map((lesson) => (
                  <div key={lesson.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{lesson.title}</h2>
                      <p>{lesson.description}</p>
                      <div className="card-actions justify-end mt-4">
                        <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                          Start
                        </Link>
                        <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                          Exercise
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Lessons */}
          {lessonsByLevel.advanced.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-accent">Advanced</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lessonsByLevel.advanced.map((lesson) => (
                  <div key={lesson.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{lesson.title}</h2>
                      <p>{lesson.description}</p>
                      <div className="card-actions justify-end mt-4">
                        <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                          Start
                        </Link>
                        <Link to={`/exercises/${lesson.id}`} className="btn btn-secondary">
                          Exercise
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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
          <span>No lessons available in the {category} category yet.</span>
        </div>
      )}
    </div>
  )
}

export default CategoryLessons
