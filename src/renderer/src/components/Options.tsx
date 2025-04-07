import React, { useState, useEffect } from 'react'

// Define types for our database entities
interface Lesson {
  id: number
  title: string
  description: string
  explanation: string | null
  video_url: string | null
  level: string | null
  category: string | null
  order_index: number | null
  created_at: string
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
  explanation: string | null
}

// Define types for exercise entities
interface Exercise {
  id: number
  lesson_id: number
  title: string
  description: string | null
  difficulty: string | null
  type: string | null
}

interface ExerciseQuestion {
  id: number
  exercise_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string | null
  option_d: string | null
  correct_answer: string
  explanation: string | null
}

const Options: React.FC = () => {
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Database management states
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonQuestions, setLessonQuestions] = useState<LessonQuestion[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [dbMessage, setDbMessage] = useState({ text: '', type: '' })

  // Form states for editing/adding
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    explanation: '',
    video_url: '',
    level: '',
    category: '',
    order_index: 0
  })

  // Exercise management states
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isEditingExercise, setIsEditingExercise] = useState(false)
  const [isAddingNewExercise, setIsAddingNewExercise] = useState(false)
  const [exerciseFormData, setExerciseFormData] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    difficulty: '',
    type: '',
    lesson_id: undefined
  })
  const [exerciseQuestions, setExerciseQuestions] = useState<ExerciseQuestion[]>([])

  // Question management states
  const [isManagingQuestions, setIsManagingQuestions] = useState(false)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [questionFormData, setQuestionFormData] = useState<Partial<ExerciseQuestion>>({
    exercise_id: undefined,
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: ''
  })

  useEffect(() => {
    async function fetchUserData(): Promise<void> {
      const result = await window.electron.ipcRenderer.invoke('get-users')
      if (result.success && result.users && result.users.length > 0) {
        setUsername(result.users[0].username)
        setUserId(result.users[0].id)
      }
    }

    fetchUserData()
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

  // Handle selecting a lesson to view/edit
  const handleSelectLesson = (lesson: Lesson): void => {
    setSelectedLesson(lesson)
    setFormData(lesson)
    fetchLessonQuestions(lesson.id)
    fetchExercises(lesson.id) // Fetch exercises for this lesson
    setIsEditing(false)
    setIsAddingNew(false)
    setSelectedExercise(null) // Reset selected exercise when changing lessons
    setIsEditingExercise(false)
    setIsAddingNewExercise(false)
  }

  // Handle selecting an exercise
  const handleSelectExercise = (exercise: Exercise): void => {
    setSelectedExercise(exercise)
    setExerciseFormData(exercise)
    fetchExerciseQuestions(exercise.id)
    setIsEditingExercise(false)
    setIsAddingNewExercise(false)
  }

  // Handle form input changes for lessons
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form input changes for exercises
  const handleExerciseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setExerciseFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Start editing the current lesson
  const handleStartEditing = (): void => {
    setIsEditing(true)
    setIsAddingNew(false)
  }

  // Start adding a new lesson
  const handleAddNew = (): void => {
    setIsAddingNew(true)
    setIsEditing(false)
    setSelectedLesson(null)
    setFormData({
      title: '',
      description: '',
      explanation: '',
      video_url: '',
      level: 'Beginner',
      category: 'Grammar',
      order_index: lessons.length + 1
    })
  }

  // Start adding a new exercise
  const handleAddNewExercise = (): void => {
    if (!selectedLesson) return

    setIsAddingNewExercise(true)
    setIsEditingExercise(false)
    setSelectedExercise(null)
    setExerciseFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      type: 'Multiple Choice',
      lesson_id: selectedLesson.id
    })
  }

  // Start editing the current exercise
  const handleStartEditingExercise = (): void => {
    setIsEditingExercise(true)
    setIsAddingNewExercise(false)
  }

  // Save the current lesson (update or create)
  const handleSaveLesson = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.description) {
        setDbMessage({ text: 'Title and description are required', type: 'error' })
        return
      }

      let result
      if (isAddingNew) {
        result = await window.electron.ipcRenderer.invoke('add-lesson', formData)
      } else {
        result = await window.electron.ipcRenderer.invoke('update-lesson', {
          id: selectedLesson?.id,
          ...formData
        })
      }

      if (result.success) {
        setDbMessage({
          text: isAddingNew ? 'Lesson added successfully!' : 'Lesson updated successfully!',
          type: 'success'
        })
        fetchLessons()
        if (isAddingNew) {
          setIsAddingNew(false)
          if (result.lesson) {
            setSelectedLesson(result.lesson)
          }
        } else {
          setIsEditing(false)
          if (result.lesson) {
            setSelectedLesson(result.lesson)
          }
        }
      } else {
        setDbMessage({ text: result.error || 'Failed to save lesson', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the lesson', type: 'error' })
    }
  }

  // Save exercise (create or update)
  const handleSaveExercise = async (): Promise<void> => {
    try {
      if (!exerciseFormData.title) {
        setDbMessage({ text: 'Exercise title is required', type: 'error' })
        return
      }

      let result
      if (isAddingNewExercise) {
        result = await window.electron.ipcRenderer.invoke('add-exercise', exerciseFormData)
      } else {
        result = await window.electron.ipcRenderer.invoke('update-exercise', {
          id: selectedExercise?.id,
          ...exerciseFormData
        })
      }

      if (result.success) {
        setDbMessage({
          text: isAddingNewExercise
            ? 'Exercise added successfully!'
            : 'Exercise updated successfully!',
          type: 'success'
        })
        if (selectedLesson) {
          fetchExercises(selectedLesson.id)
        }
        setIsAddingNewExercise(false)
        setIsEditingExercise(false)
        if (result.exercise) {
          setSelectedExercise(result.exercise)
        }
      } else {
        setDbMessage({ text: result.error || 'Failed to save exercise', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the exercise', type: 'error' })
    }
  }

  // Delete the current lesson
  const handleDeleteLesson = async (): Promise<void> => {
    if (!selectedLesson) return

    if (
      window.confirm(
        `Are you sure you want to delete "${selectedLesson.title}"? This action cannot be undone.`
      )
    ) {
      try {
        const result = await window.electron.ipcRenderer.invoke('delete-lesson', selectedLesson.id)
        if (result.success) {
          setDbMessage({ text: 'Lesson deleted successfully!', type: 'success' })
          setSelectedLesson(null)
          fetchLessons()
        } else {
          setDbMessage({ text: result.error || 'Failed to delete lesson', type: 'error' })
        }
      } catch (error) {
        setDbMessage({ text: 'An error occurred while deleting the lesson', type: 'error' })
      }
    }
  }

  // Delete an exercise
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

  // Open question management modal
  const handleManageQuestions = (): void => {
    if (!selectedExercise) return
    setIsManagingQuestions(true)
    fetchExerciseQuestions(selectedExercise.id)
  }

  // Add new question
  const handleAddNewQuestion = (): void => {
    if (!selectedExercise) return

    setIsAddingQuestion(true)
    setIsEditingQuestion(false)
    setQuestionFormData({
      exercise_id: selectedExercise.id,
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      explanation: ''
    })
  }

  // Edit existing question
  const handleEditQuestion = (question: ExerciseQuestion): void => {
    setIsEditingQuestion(true)
    setIsAddingQuestion(false)
    setQuestionFormData(question)
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: number): Promise<void> => {
    if (
      window.confirm('Are you sure you want to delete this question? This action cannot be undone.')
    ) {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-exercise-question',
          questionId
        )
        if (result.success) {
          setDbMessage({ text: 'Question deleted successfully!', type: 'success' })
          if (selectedExercise) {
            fetchExerciseQuestions(selectedExercise.id)
          }
        } else {
          setDbMessage({ text: result.error || 'Failed to delete question', type: 'error' })
        }
      } catch (error) {
        setDbMessage({ text: 'An error occurred while deleting the question', type: 'error' })
      }
    }
  }

  // Save question (create or update)
  const handleSaveQuestion = async (): Promise<void> => {
    try {
      if (
        !questionFormData.question ||
        !questionFormData.option_a ||
        !questionFormData.option_b ||
        !questionFormData.correct_answer
      ) {
        setDbMessage({
          text: 'Question, options A & B, and correct answer are required',
          type: 'error'
        })
        return
      }

      let result
      if (isAddingQuestion) {
        result = await window.electron.ipcRenderer.invoke('add-exercise-question', questionFormData)
      } else {
        result = await window.electron.ipcRenderer.invoke(
          'update-exercise-question',
          questionFormData
        )
      }

      if (result.success) {
        setDbMessage({
          text: isAddingQuestion
            ? 'Question added successfully!'
            : 'Question updated successfully!',
          type: 'success'
        })

        if (selectedExercise) {
          fetchExerciseQuestions(selectedExercise.id)
        }

        setIsAddingQuestion(false)
        setIsEditingQuestion(false)
      } else {
        setDbMessage({ text: result.error || 'Failed to save question', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the question', type: 'error' })
    }
  }

  // Cancel editing/adding
  const handleCancel = (): void => {
    if (selectedLesson) {
      setFormData(selectedLesson)
    } else {
      setFormData({
        title: '',
        description: '',
        explanation: '',
        video_url: '',
        level: '',
        category: '',
        order_index: 0
      })
    }
    setIsEditing(false)
    setIsAddingNew(false)
  }

  // Cancel editing/adding exercise
  const handleCancelExercise = (): void => {
    if (selectedExercise) {
      setExerciseFormData(selectedExercise)
    } else {
      setExerciseFormData({
        title: '',
        description: '',
        difficulty: '',
        type: '',
        lesson_id: selectedLesson?.id || undefined
      })
    }
    setIsEditingExercise(false)
    setIsAddingNewExercise(false)
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewUsername(e.target.value)
  }

  const updateUsername = async (): Promise<void> => {
    if (!newUsername.trim()) {
      setMessage({ text: 'Username cannot be empty', type: 'error' })
      return
    }

    if (!userId) {
      setMessage({ text: 'No user found to update', type: 'error' })
      return
    }

    try {
      const result = await window.electron.ipcRenderer.invoke('update-username', {
        userId,
        newUsername: newUsername.trim()
      })

      if (result.success) {
        setUsername(newUsername)
        setNewUsername('')
        setMessage({ text: 'Username updated successfully!', type: 'success' })
      } else {
        setMessage({ text: result.error || 'Failed to update username', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while updating username', type: 'error' })
    }
  }

  return (
    <div className="w-screen max-w-full p-10 pt-20 sm:pl-10 sm:pr-10 md:pl-24 md:pr-24 bg-gray-200">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">Options</h1>
      <p className="mb-8">Configure your JapanoLearn experience</p>

      {/* Settings Accordion */}
      <div className="max-w-3xl mx-auto">
        <div className="collapse collapse-arrow bg-base-100 border border-base-300 mb-4">
          <input type="radio" name="settings-accordion" defaultChecked />
          <div className="collapse-title font-semibold text-lg">Profile Settings</div>
          <div className="collapse-content">
            <div className="form-control w-full max-w-md">
              <label className="label">
                <span className="label-text">Current Username</span>
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="input input-bordered w-full max-w-md mb-4"
              />

              <label className="label">
                <span className="label-text">New Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={handleUsernameChange}
                className="input input-bordered w-full max-w-md mb-4"
              />

              {message.text && (
                <div
                  className={`alert ${
                    message.type === 'success' ? 'alert-success' : 'alert-error'
                  } mb-4`}
                >
                  <span>{message.text}</span>
                </div>
              )}

              <button
                className="btn btn-primary w-full max-w-xs"
                onClick={updateUsername}
                disabled={!newUsername.trim()}
              >
                Update Username
              </button>
            </div>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-100 border border-base-300 mb-4">
          <input type="radio" name="settings-accordion" />
          <div className="collapse-title font-semibold text-lg">Application Settings</div>
          <div className="collapse-content">
            <p className="text-sm">Application settings will be available in future updates.</p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-100 border border-base-300">
          <input type="radio" name="settings-accordion" />
          <div className="collapse-title font-semibold text-lg">Data Management</div>
          <div className="collapse-content">
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
                Warning: Modifying the lesson database can cause irreversible changes. Please
                proceed with caution.
              </span>
            </div>

            {dbMessage.text && (
              <div
                className={`alert ${
                  dbMessage.type === 'success' ? 'alert-success' : 'alert-error'
                } mb-4`}
              >
                <span>{dbMessage.text}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              {/* Lessons List */}
              <div className="w-full md:w-1/3 bg-base-200 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Lessons</h3>
                  <button className="btn btn-sm btn-primary" onClick={handleAddNew}>
                    Add New
                  </button>
                </div>
                <div className="overflow-y-auto max-h-96">
                  {lessons.length > 0 ? (
                    <ul className="menu bg-base-100 rounded-box">
                      {lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <a
                            className={selectedLesson?.id === lesson.id ? 'active' : ''}
                            onClick={() => handleSelectLesson(lesson)}
                          >
                            {lesson.title}
                            <span className="badge badge-sm">{lesson.level}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500">No lessons found</p>
                  )}
                </div>
              </div>

              {/* Lesson Details/Editor */}
              <div className="w-full md:w-2/3 bg-base-200 p-4 rounded-lg">
                {selectedLesson || isAddingNew ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold">
                        {isAddingNew
                          ? 'Add New Lesson'
                          : isEditing
                            ? 'Edit Lesson'
                            : 'Lesson Details'}
                      </h3>
                      <div className="flex gap-2">
                        {!isEditing && !isAddingNew && (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={handleStartEditing}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-error" onClick={handleDeleteLesson}>
                              Delete
                            </button>
                          </>
                        )}
                        {(isEditing || isAddingNew) && (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={handleSaveLesson}>
                              Save
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lesson Form */}
                    <div className="form-control">
                      {/* ID Field (only shown when editing or viewing an existing lesson) */}
                      {!isAddingNew && selectedLesson && (
                        <div className="mb-4">
                          <label className="label">
                            <span className="label-text font-semibold">Lesson ID</span>
                          </label>
                          <input
                            type="text"
                            value={selectedLesson.id}
                            disabled
                            className="input input-bordered w-full max-w-xs bg-gray-100"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            This is the unique identifier for this lesson. It cannot be changed.
                          </p>
                        </div>
                      )}

                      <label className="label">
                        <span className="label-text">Title</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing && !isAddingNew}
                        className="input input-bordered mb-2"
                        placeholder="Lesson title"
                      />

                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing && !isAddingNew}
                        className="textarea textarea-bordered mb-2"
                        placeholder="Brief description of the lesson"
                        rows={2}
                      ></textarea>

                      <label className="label">
                        <span className="label-text">Explanation</span>
                      </label>
                      <textarea
                        name="explanation"
                        value={formData.explanation || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing && !isAddingNew}
                        className="textarea textarea-bordered mb-2"
                        placeholder="Detailed explanation of the lesson content"
                        rows={4}
                      ></textarea>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text">Video URL</span>
                          </label>
                          <input
                            type="text"
                            name="video_url"
                            value={formData.video_url || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing && !isAddingNew}
                            className="input input-bordered w-full mb-2"
                            placeholder="YouTube video URL"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Level</span>
                          </label>
                          <select
                            name="level"
                            value={formData.level || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing && !isAddingNew}
                            className="select select-bordered w-full mb-2"
                          >
                            <option value="">Select level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Category</span>
                          </label>
                          <select
                            name="category"
                            value={formData.category || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing && !isAddingNew}
                            className="select select-bordered w-full mb-2"
                          >
                            <option value="">Select category</option>
                            <option value="Grammar">Grammar</option>
                            <option value="Vocabulary">Vocabulary</option>
                            <option value="Conversation">Conversation</option>
                            <option value="Reading">Reading</option>
                            <option value="Writing">Writing</option>
                            <option value="Culture">Culture</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Order Index</span>
                          </label>
                          <input
                            type="number"
                            name="order_index"
                            value={formData.order_index || 0}
                            onChange={handleInputChange}
                            disabled={!isEditing && !isAddingNew}
                            className="input input-bordered w-full mb-2"
                            placeholder="Display order"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lesson Questions Section (only shown when viewing) */}
                    {!isEditing && !isAddingNew && selectedLesson && (
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">Lesson Questions</h4>
                          <button className="btn btn-sm btn-outline">Manage Questions</button>
                        </div>

                        {lessonQuestions.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                              <thead>
                                <tr>
                                  <th>Question</th>
                                  <th>Correct Answer</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lessonQuestions.map((q) => (
                                  <tr key={q.id}>
                                    <td>{q.question}</td>
                                    <td>{q.correct_answer}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-4">
                            No questions for this lesson
                          </p>
                        )}
                      </div>
                    )}

                    {/* Exercises Section (only shown when viewing a lesson) */}
                    {!isEditing && !isAddingNew && selectedLesson && (
                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Exercises</h4>
                          <button className="btn btn-sm btn-primary" onClick={handleAddNewExercise}>
                            Add Exercise
                          </button>
                        </div>

                        {exercises.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                  selectedExercise?.id === exercise.id
                                    ? 'border-2 border-primary'
                                    : ''
                                }`}
                                onClick={() => handleSelectExercise(exercise)}
                              >
                                <div className="card-body p-4">
                                  <div className="flex justify-between items-start">
                                    <h5 className="card-title text-base">{exercise.title}</h5>
                                    <div className="flex gap-1">
                                      {exercise.difficulty && (
                                        <span className="badge badge-sm">
                                          {exercise.difficulty}
                                        </span>
                                      )}
                                      {exercise.type && (
                                        <span className="badge badge-sm badge-outline">
                                          {exercise.type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {exercise.description && (
                                    <p className="text-sm text-gray-600">{exercise.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-4">
                            No exercises for this lesson
                          </p>
                        )}
                      </div>
                    )}

                    {/* Exercise Editor (shown when adding/editing an exercise) */}
                    {(isAddingNewExercise || isEditingExercise) && (
                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">
                            {isAddingNewExercise ? 'Add New Exercise' : 'Edit Exercise'}
                          </h4>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-primary" onClick={handleSaveExercise}>
                              Save
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={handleCancelExercise}>
                              Cancel
                            </button>
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Title</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={exerciseFormData.title || ''}
                            onChange={handleExerciseInputChange}
                            className="input input-bordered mb-2"
                            placeholder="Exercise title"
                          />

                          <label className="label">
                            <span className="label-text">Description</span>
                          </label>
                          <textarea
                            name="description"
                            value={exerciseFormData.description || ''}
                            onChange={handleExerciseInputChange}
                            className="textarea textarea-bordered mb-2"
                            placeholder="Brief description of the exercise"
                            rows={2}
                          ></textarea>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text">Difficulty</span>
                              </label>
                              <select
                                name="difficulty"
                                value={exerciseFormData.difficulty || ''}
                                onChange={handleExerciseInputChange}
                                className="select select-bordered w-full mb-2"
                              >
                                <option value="">Select difficulty</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>

                            <div>
                              <label className="label">
                                <span className="label-text">Type</span>
                              </label>
                              <select
                                name="type"
                                value={exerciseFormData.type || ''}
                                onChange={handleExerciseInputChange}
                                className="select select-bordered w-full mb-2"
                              >
                                <option value="">Select type</option>
                                <option value="Multiple Choice">Multiple Choice</option>
                                <option value="Fill in the Blank">Fill in the Blank</option>
                                <option value="Matching">Matching</option>
                                <option value="Listening">Listening</option>
                                <option value="Writing">Writing</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exercise Details (shown when an exercise is selected) */}
                    {selectedExercise && !isAddingNewExercise && !isEditingExercise && (
                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Exercise Details</h4>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handleStartEditingExercise}
                            >
                              Edit
                            </button>
                            <button className="btn btn-sm btn-error" onClick={handleDeleteExercise}>
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="bg-base-100 p-4 rounded-lg mb-4">
                          <div className="mb-2">
                            <span className="font-semibold">ID:</span> {selectedExercise.id}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Title:</span> {selectedExercise.title}
                          </div>
                          {selectedExercise.description && (
                            <div className="mb-2">
                              <span className="font-semibold">Description:</span>{' '}
                              {selectedExercise.description}
                            </div>
                          )}
                          <div className="mb-2">
                            <span className="font-semibold">Difficulty:</span>{' '}
                            {selectedExercise.difficulty || 'Not specified'}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Type:</span>{' '}
                            {selectedExercise.type || 'Not specified'}
                          </div>
                        </div>

                        {/* Exercise Questions Section */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold">Exercise Questions</h5>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={handleManageQuestions}
                            >
                              Manage Questions
                            </button>
                          </div>

                          {exerciseQuestions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="table table-zebra w-full">
                                <thead>
                                  <tr>
                                    <th>Question</th>
                                    <th>Correct Answer</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exerciseQuestions.map((q) => (
                                    <tr key={q.id}>
                                      <td>{q.question}</td>
                                      <td>{q.correct_answer}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">
                              No questions for this exercise
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-500 mb-4">
                      Select a lesson to view details or add a new one
                    </p>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                      Add New Lesson
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Management Modal */}
      {selectedExercise && (
        <div className={`modal ${isManagingQuestions ? 'modal-open' : ''}`}>
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              Manage Questions for &quot;{selectedExercise.title}&quot;
            </h3>

            {/* Question List */}
            <div className="overflow-x-auto mb-4">
              {exerciseQuestions.length > 0 ? (
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Correct Answer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseQuestions.map((q) => (
                      <tr key={q.id}>
                        <td>{q.question}</td>
                        <td>{q.correct_answer}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs btn-primary"
                              onClick={() => handleEditQuestion(q)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-4">No questions for this exercise</p>
              )}
            </div>

            {/* Add New Question Button */}
            <button className="btn btn-primary mb-4" onClick={handleAddNewQuestion}>
              Add New Question
            </button>

            {/* Question Form (shown when adding/editing) */}
            {(isAddingQuestion || isEditingQuestion) && (
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">
                  {isAddingQuestion ? 'Add New Question' : 'Edit Question'}
                </h4>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Question</span>
                  </label>
                  <input
                    type="text"
                    value={questionFormData.question || ''}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, question: e.target.value })
                    }
                    className="input input-bordered mb-2"
                    placeholder="Enter the question"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Option A</span>
                      </label>
                      <input
                        type="text"
                        value={questionFormData.option_a || ''}
                        onChange={(e) =>
                          setQuestionFormData({ ...questionFormData, option_a: e.target.value })
                        }
                        className="input input-bordered mb-2 w-full"
                        placeholder="Option A"
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Option B</span>
                      </label>
                      <input
                        type="text"
                        value={questionFormData.option_b || ''}
                        onChange={(e) =>
                          setQuestionFormData({ ...questionFormData, option_b: e.target.value })
                        }
                        className="input input-bordered mb-2 w-full"
                        placeholder="Option B"
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Option C (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={questionFormData.option_c || ''}
                        onChange={(e) =>
                          setQuestionFormData({ ...questionFormData, option_c: e.target.value })
                        }
                        className="input input-bordered mb-2 w-full"
                        placeholder="Option C"
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">Option D (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={questionFormData.option_d || ''}
                        onChange={(e) =>
                          setQuestionFormData({ ...questionFormData, option_d: e.target.value })
                        }
                        className="input input-bordered mb-2 w-full"
                        placeholder="Option D"
                      />
                    </div>
                  </div>

                  <label className="label">
                    <span className="label-text">Correct Answer</span>
                  </label>
                  <select
                    value={questionFormData.correct_answer || ''}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })
                    }
                    className="select select-bordered mb-2"
                  >
                    <option value="">Select correct answer</option>
                    {questionFormData.option_a && (
                      <option value={questionFormData.option_a}>
                        A: {questionFormData.option_a}
                      </option>
                    )}
                    {questionFormData.option_b && (
                      <option value={questionFormData.option_b}>
                        B: {questionFormData.option_b}
                      </option>
                    )}
                    {questionFormData.option_c && (
                      <option value={questionFormData.option_c}>
                        C: {questionFormData.option_c}
                      </option>
                    )}
                    {questionFormData.option_d && (
                      <option value={questionFormData.option_d}>
                        D: {questionFormData.option_d}
                      </option>
                    )}
                  </select>

                  <label className="label">
                    <span className="label-text">Explanation (Optional)</span>
                  </label>
                  <textarea
                    value={questionFormData.explanation || ''}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, explanation: e.target.value })
                    }
                    className="textarea textarea-bordered mb-2"
                    placeholder="Explanation for the correct answer"
                    rows={2}
                  ></textarea>

                  <div className="flex justify-end gap-2 mt-2">
                    <button className="btn btn-primary" onClick={handleSaveQuestion}>
                      Save
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setIsAddingQuestion(false)
                        setIsEditingQuestion(false)
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setIsManagingQuestions(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Options
