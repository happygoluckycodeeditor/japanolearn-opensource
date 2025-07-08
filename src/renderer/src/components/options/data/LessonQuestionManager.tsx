import React, { useState, useEffect } from 'react'
import { Lesson, LessonQuestion } from '../../../types/database'
import ImageSelector from '../../common/ImageSelector'

interface LessonQuestionManagerProps {
  lesson: Lesson
  questions: LessonQuestion[]
  isOpen: boolean
  onClose: () => void
  onQuestionsUpdated: () => void
  setDbMessage: (message: { text: string; type: string }) => void
}

const LessonQuestionManager: React.FC<LessonQuestionManagerProps> = ({
  lesson,
  questions,
  isOpen,
  onClose,
  onQuestionsUpdated,
  setDbMessage
}) => {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [questionFormData, setQuestionFormData] = useState<Partial<LessonQuestion>>({
    lesson_id: lesson.id,
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: '',
    image_path: null
  })

  // Add state for user progress
  const [progress, setProgress] = useState<{ xp_earned: number; completed: number } | null>(null)

  // Fetch userId and progress on mount or when lesson changes
  useEffect(() => {
    async function fetchUserAndProgress(): Promise<void> {
      try {
        // Fetch userId (assume first user, as in Dashboard)
        const userResult = await window.electron.ipcRenderer.invoke('get-users')
        if (userResult.success && userResult.users && userResult.users.length > 0) {
          const uid = userResult.users[0].id
          // Fetch progress for this lesson and user
          const progressResult = await window.electron.ipcRenderer.invoke(
            'get-user-lesson-progress',
            {
              userId: uid,
              lessonId: lesson.id
            }
          )
          if (progressResult.success && progressResult.progress) {
            setProgress(progressResult.progress)
          } else {
            setProgress(null)
          }
        }
      } catch (err) {
        setProgress(null)
      }
    }
    if (isOpen) {
      fetchUserAndProgress()
    }
  }, [lesson.id, isOpen])

  const handleAddNewQuestion = (): void => {
    setIsAddingQuestion(true)
    setIsEditingQuestion(false)
    setQuestionFormData({
      lesson_id: lesson.id,
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      explanation: '',
      image_path: null
    })
  }

  const handleEditQuestion = (question: LessonQuestion): void => {
    setIsEditingQuestion(true)
    setIsAddingQuestion(false)
    setQuestionFormData(question)
  }

  const handleDeleteQuestion = async (questionId: number): Promise<void> => {
    if (
      window.confirm('Are you sure you want to delete this question? This action cannot be undone.')
    ) {
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-lesson-question',
          questionId
        )
        if (result.success) {
          setDbMessage({ text: 'Question deleted successfully!', type: 'success' })
          onQuestionsUpdated()
        } else {
          setDbMessage({ text: result.error || 'Failed to delete question', type: 'error' })
        }
      } catch (error) {
        setDbMessage({ text: 'An error occurred while deleting the question', type: 'error' })
      }
    }
  }

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
        result = await window.electron.ipcRenderer.invoke('add-lesson-question', questionFormData)
      } else {
        result = await window.electron.ipcRenderer.invoke(
          'update-lesson-question',
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
        onQuestionsUpdated()
        setIsAddingQuestion(false)
        setIsEditingQuestion(false)
      } else {
        setDbMessage({ text: result.error || 'Failed to save question', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the question', type: 'error' })
    }
  }

  const handleImageSelected = (path: string | null): void => {
    setQuestionFormData({ ...questionFormData, image_path: path })
  }

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Manage Questions for &quot;{lesson.title}&quot;</h3>

        {/* User Progress Summary */}
        {progress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <strong>Lesson Completion:</strong>{' '}
            {progress.completed ? '✅ Completed' : '❌ Not completed'}
            <br />
            <strong>XP Earned:</strong> {progress.xp_earned}
          </div>
        )}

        {/* Question List */}
        <div className="overflow-x-auto mb-4">
          {questions.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Correct Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
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
            <p className="text-center text-gray-500 py-4">No questions for this lesson</p>
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
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
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

              <ImageSelector
                initialImagePath={questionFormData.image_path || null}
                onImageSelected={handleImageSelected}
              />

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
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonQuestionManager
