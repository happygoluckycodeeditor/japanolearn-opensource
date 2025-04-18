import React, { useState, useEffect } from 'react'
import LessonsList from './data/LessonsList'
import LessonEditor from './data/LessonEditor'
import ExerciseEditor from './data/ExerciseEditor'
import ExerciseDetails from './data/ExerciseDetails'
import QuestionManager from './data/QuestionManager'
import { Lesson, Exercise, ExerciseQuestion, LessonQuestion } from '../../types/database'

const DataManagement: React.FC = () => {
  const [dbMessage, setDbMessage] = useState({ text: '', type: '' })
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Exercise states
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isEditingExercise, setIsEditingExercise] = useState(false)
  const [isAddingNewExercise, setIsAddingNewExercise] = useState(false)

  // Question management states
  const [isManagingQuestions, setIsManagingQuestions] = useState(false)
  const [exerciseQuestions, setExerciseQuestions] = useState<ExerciseQuestion[]>([])
  const [lessonQuestions, setLessonQuestions] = useState<LessonQuestion[]>([])

  useEffect(() => {
    fetchLessons()
  }, [])

  // Fetch all lessons from the database
  const fetchLessons = async (): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-lessons')
      if (result.success) {
        setLessons(result.lessons)
      } else {
        setDbMessage({ text: result.error || 'Failed to fetch lessons', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while fetching lessons', type: 'error' })
    }
  }

  // Fetch questions for a specific lesson
  const fetchLessonQuestions = async (lessonId: number): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-lesson-questions', lessonId)
      if (result.success) {
        setLessonQuestions(result.questions)
      } else {
        setDbMessage({ text: result.error || 'Failed to fetch lesson questions', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while fetching lesson questions', type: 'error' })
    }
  }

  // Fetch exercises for a specific lesson
  const fetchExercises = async (lessonId: number): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-exercises', lessonId)
      if (result.success) {
        setExercises(result.exercises)
      } else {
        setDbMessage({ text: result.error || 'Failed to fetch exercises', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while fetching exercises', type: 'error' })
    }
  }

  // Fetch questions for a specific exercise
  const fetchExerciseQuestions = async (exerciseId: number): Promise<void> => {
    try {
      const result = await window.electron.ipcRenderer.invoke('get-exercise-questions', exerciseId)
      if (result.success) {
        setExerciseQuestions(result.questions)
      } else {
        setDbMessage({ text: result.error || 'Failed to fetch exercise questions', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while fetching exercise questions', type: 'error' })
    }
  }

  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson): void => {
    setSelectedLesson(lesson)
    fetchLessonQuestions(lesson.id)
    fetchExercises(lesson.id)
    setIsEditing(false)
    setIsAddingNew(false)
    setSelectedExercise(null)
    setIsEditingExercise(false)
    setIsAddingNewExercise(false)
  }

  // Handle selecting an exercise
  const handleSelectExercise = (exercise: Exercise): void => {
    setSelectedExercise(exercise)
    fetchExerciseQuestions(exercise.id)
    setIsEditingExercise(false)
    setIsAddingNewExercise(false)
  }

  // Handle deleting an exercise
  const handleDeleteExercise = async (): Promise<void> => {
    if (!selectedExercise) return

    if (
      window.confirm(
        `Are you sure you want to delete "${selectedExercise.title}"? This action cannot be undone.`
      )
    ) {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-exercise',
          selectedExercise.id
        )
        if (result.success) {
          setDbMessage({ text: 'Exercise deleted successfully!', type: 'success' })
          setSelectedExercise(null)
          if (selectedLesson) {
            fetchExercises(selectedLesson.id)
          }
        } else {
          setDbMessage({ text: result.error || 'Failed to delete exercise', type: 'error' })
        }
      } catch (error) {
        setDbMessage({ text: 'An error occurred while deleting the exercise', type: 'error' })
      }
    }
  }

  return (
    <div>
      <div className="alert alert-warning mb-4">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>
          Warning: Modifying the lesson database can cause irreversible changes. Please proceed with
          caution.
        </span>
      </div>

      {dbMessage.text && (
        <div
          className={`alert ${dbMessage.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}
        >
          <span>{dbMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Lessons List */}
        <LessonsList
          lessons={lessons}
          selectedLesson={selectedLesson}
          onSelectLesson={handleSelectLesson}
          onAddNew={() => {
            setIsAddingNew(true)
            setIsEditing(false)
            setSelectedLesson(null)
          }}
        />

        {/* Lesson Details/Editor */}
        <div className="w-full bg-base-200 p-4 rounded-lg">
          {selectedLesson || isAddingNew ? (
            <LessonEditor
              selectedLesson={selectedLesson}
              isEditing={isEditing}
              isAddingNew={isAddingNew}
              lessonQuestions={lessonQuestions}
              exercises={exercises}
              onStartEditing={() => setIsEditing(true)}
              onSave={() => {
                fetchLessons()
                setIsEditing(false)
                setIsAddingNew(false)
              }}
              onCancel={() => {
                setIsEditing(false)
                setIsAddingNew(false)
              }}
              onDelete={() => {
                setSelectedLesson(null)
                fetchLessons()
              }}
              onSelectExercise={handleSelectExercise}
              onAddNewExercise={() => {
                setIsAddingNewExercise(true)
                setIsEditingExercise(false)
                setSelectedExercise(null)
              }}
              setDbMessage={setDbMessage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 mb-4">Select a lesson to view details or add a new one</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsAddingNew(true)
                  setIsEditing(false)
                }}
              >
                Add New Lesson
              </button>
            </div>
          )}

          {/* Exercise Editor */}
          {(isAddingNewExercise || isEditingExercise) && (
            <ExerciseEditor
              selectedExercise={selectedExercise}
              isAddingNew={isAddingNewExercise}
              isEditing={isEditingExercise}
              lessonId={selectedLesson?.id}
              onSave={() => {
                if (selectedLesson) fetchExercises(selectedLesson.id)
                setIsAddingNewExercise(false)
                setIsEditingExercise(false)
              }}
              onCancel={() => {
                setIsAddingNewExercise(false)
                setIsEditingExercise(false)
              }}
              setDbMessage={setDbMessage}
            />
          )}

          {/* Exercise Details */}
          {selectedExercise && !isAddingNewExercise && !isEditingExercise && (
            <ExerciseDetails
              exercise={selectedExercise}
              questions={exerciseQuestions}
              onEdit={() => setIsEditingExercise(true)}
              onDelete={handleDeleteExercise}
              onManageQuestions={() => setIsManagingQuestions(true)}
            />
          )}
        </div>
      </div>

      {/* Question Management Modal */}
      {selectedExercise && (
        <QuestionManager
          exercise={selectedExercise}
          questions={exerciseQuestions}
          isOpen={isManagingQuestions}
          onClose={() => setIsManagingQuestions(false)}
          onQuestionsUpdated={() => {
            if (selectedExercise) {
              fetchExerciseQuestions(selectedExercise.id)
            }
          }}
          setDbMessage={setDbMessage}
        />
      )}
    </div>
  )
}

export default DataManagement
