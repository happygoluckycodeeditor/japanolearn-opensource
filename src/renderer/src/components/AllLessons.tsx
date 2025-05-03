import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lesson } from '../types/database'

const AllLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        const result = await window.electron.ipcRenderer.invoke('get-lessons')
        if (result.success) {
          setLessons(result.lessons)
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
  }, [])

  // Get unique categories for the category navigation
  const categories = [...new Set(lessons.map(lesson => lesson.category))].filter(Boolean)

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
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // Count lessons by level
  const beginnerCount = lessons.filter(lesson => lesson.level?.toLowerCase() === 'beginner').length
  const intermediateCount = lessons.filter(lesson => lesson.level?.toLowerCase() === 'intermediate').length
  const advancedCount = lessons.filter(lesson => lesson.level?.toLowerCase() === 'advanced').length

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">Japanese Lessons</h1>
      <p className="mb-8 text-lg">Choose your skill level to start learning Japanese, or browse lessons by category.</p>
      
      {/* Level Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-12">
        {/* Beginner Level Card */}
        <Link to="/level/beginner" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-2">Beginner</h2>
            <div className="text-6xl font-bold text-primary mb-4">{beginnerCount}</div>
            <p>Start your Japanese journey with basic phrases, hiragana, and simple grammar.</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-primary btn-wide">Explore Lessons</button>
            </div>
          </div>
        </Link>
        
        {/* Intermediate Level Card */}
        <Link to="/level/intermediate" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-2">Intermediate</h2>
            <div className="text-6xl font-bold text-secondary mb-4">{intermediateCount}</div>
            <p>Expand your knowledge with more complex grammar, kanji, and conversation skills.</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-secondary btn-wide">Explore Lessons</button>
            </div>
          </div>
        </Link>
        
        {/* Advanced Level Card */}
        <Link to="/level/advanced" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center mb-2">Advanced</h2>
            <div className="text-6xl font-bold text-accent mb-4">{advancedCount}</div>
            <p>Master complex grammar patterns, nuanced expressions, and advanced reading skills.</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-accent btn-wide">Explore Lessons</button>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Categories navigation */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <Link 
              key={category} 
              to={`/category/${category}`} 
              className="btn btn-outline"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllLessons
