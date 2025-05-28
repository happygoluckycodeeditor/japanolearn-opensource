import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Exercise {
  id: number
  lesson_id: number
  title: string
  description: string
  difficulty: string
  type: string
}

interface ExerciseQuestion {
  id: number
  exercise_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
  image_path: string | null
}

interface Lesson {
  id: number
  title: string
  level: string
}

const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (exerciseId) {
      loadExerciseData()
    }
  }, [exerciseId])

  const loadExerciseData = async (): Promise<void> => {
    try {
      setLoading(true)

      // Get all lessons first
      const lessonsResult = await window.electron.ipcRenderer.invoke('get-lessons')
      if (!lessonsResult.success) {
        throw new Error(lessonsResult.error)
      }

      // Find the exercise by checking all lessons
      let currentExercise: Exercise | null = null
      let currentLesson: Lesson | null = null

      for (const lesson of lessonsResult.lessons) {
        const exercisesResult = await window.electron.ipcRenderer.invoke('get-exercises', lesson.id)
        if (exercisesResult.success) {
          const foundExercise = exercisesResult.exercises.find(
            (ex: Exercise) => ex.id === parseInt(exerciseId!)
          )
          if (foundExercise) {
            currentExercise = foundExercise
            currentLesson = lesson
            break
          }
        }
      }

      if (!currentExercise || !currentLesson) {
        throw new Error('Exercise not found')
      }

      setExercise(currentExercise)
      setLesson(currentLesson)

      // Get exercise questions
      const questionsResult = await window.electron.ipcRenderer.invoke(
        'get-exercise-questions',
        parseInt(exerciseId!)
      )
      if (!questionsResult.success) {
        throw new Error(questionsResult.error)
      }
      setQuestions(questionsResult.questions)

      // Load image URLs for questions that have images
      const imageUrlPromises = questionsResult.questions
        .filter((q: ExerciseQuestion) => q.image_path)
        .map(async (q: ExerciseQuestion) => {
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

  const handleSubmitExercise = (): void => {
    setShowResults(true)
  }

  const resetExercise = (): void => {
    setSelectedAnswers({})
    setShowResults(false)
  }

  const handleBackClick = (): void => {
    navigate('/exercises')
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

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading exercise...</div>
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

  if (!exercise || !lesson) {
    return (
      <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200 min-h-screen">
        <div className="text-xl">Exercise not found</div>
      </div>
    )
  }

  const score = showResults ? calculateScore() : null

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
          Back to Exercises
        </button>
      </div>

      {/* Exercise Title */}
      <h1 className="text-4xl font-bold mb-6 text-gray-800">{exercise.title}</h1>

      {/* Exercise Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-700">Exercise Details</h2>
            <p className="text-gray-600 leading-relaxed">{exercise.description}</p>
          </div>
          <div className="text-right">
            {exercise.difficulty && (
              <span className={`text-lg font-semibold ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Exercise and Lesson badges */}
        <div className="flex gap-2 mt-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Lesson: {lesson.title}
          </span>
          {lesson.level && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Level: {lesson.level}
            </span>
          )}
          {exercise.type && (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Type: {exercise.type}
            </span>
          )}
        </div>
      </div>

      {/* Exercise Questions */}
      {questions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Questions</h2>
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

          {/* Exercise Controls */}
          <div className="mt-6 flex gap-4">
            {!showResults ? (
              <button
                onClick={handleSubmitExercise}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Submit Exercise
              </button>
            ) : (
              <button
                onClick={resetExercise}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            )}
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
            <span>No questions available for this exercise yet.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExercisePage
