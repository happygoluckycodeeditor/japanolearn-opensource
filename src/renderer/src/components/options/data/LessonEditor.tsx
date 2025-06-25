import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css' // This is all you need!
import { Lesson, LessonQuestion, Exercise } from '../../../types/database'
import LessonQuestionManager from './LessonQuestionManager'

interface LessonEditorProps {
  selectedLesson: Lesson | null
  isEditing: boolean
  isAddingNew: boolean
  lessonQuestions: LessonQuestion[]
  exercises: Exercise[]
  onStartEditing: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  onSelectExercise: (exercise: Exercise) => void
  onAddNewExercise: () => void
  onQuestionsUpdated: (lessonId: number) => void
  setDbMessage: (message: { text: string; type: string }) => void
}

// Simple Quill configuration - uses defaults which are great!
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ]
}

const LessonEditor: React.FC<LessonEditorProps> = ({
  selectedLesson,
  isEditing,
  isAddingNew,
  lessonQuestions,
  exercises,
  onStartEditing,
  onSave,
  onCancel,
  onDelete,
  onSelectExercise,
  onAddNewExercise,
  onQuestionsUpdated,
  setDbMessage
}) => {
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    explanation: '',
    video_url: '',
    level: 'Beginner',
    category: 'Grammar',
    order_index: 0,
    exp: 10
  })

  const [isManagingQuestions, setIsManagingQuestions] = useState(false)

  useEffect(() => {
    if (selectedLesson && !isAddingNew) {
      setFormData(selectedLesson)
    } else {
      setFormData({
        title: '',
        description: '',
        explanation: '',
        video_url: '',
        level: 'Beginner',
        category: 'Grammar',
        order_index: 0,
        exp: 10
      })
    }
  }, [selectedLesson, isAddingNew])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    const processedValue = name === 'order_index' || name === 'exp' ? parseInt(value) || 0 : value
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleExplanationChange = (content: string): void => {
    setFormData((prev) => ({ ...prev, explanation: content }))
  }

  const handleSaveLesson = async (): Promise<void> => {
    try {
      if (!formData.title || !formData.description) {
        setDbMessage({ text: 'Title and description are required', type: 'error' })
        return
      }

      if (!formData.exp || formData.exp < 1) {
        setDbMessage({ text: 'XP must be at least 1', type: 'error' })
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
        onSave()
      } else {
        setDbMessage({ text: result.error || 'Failed to save lesson', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the lesson', type: 'error' })
    }
  }

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
          onDelete()
        } else {
          setDbMessage({ text: result.error || 'Failed to delete lesson', type: 'error' })
        }
      } catch (error) {
        setDbMessage({ text: 'An error occurred while deleting the lesson', type: 'error' })
      }
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">
          {isAddingNew ? 'Add New Lesson' : isEditing ? 'Edit Lesson' : 'Lesson Details'}
        </h3>
        <div className="flex gap-2">
          {!isEditing && !isAddingNew && (
            <>
              <button className="btn btn-sm btn-primary" onClick={onStartEditing}>
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
              <button className="btn btn-sm btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="form-control">
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

        {/* Simplified Explanation Section */}
        <label className="label">
          <span className="label-text">Explanation</span>
        </label>
        {isEditing || isAddingNew ? (
          <div className="mb-4">
            <ReactQuill
              theme="snow"
              value={formData.explanation || ''}
              onChange={handleExplanationChange}
              modules={quillModules}
              placeholder="Write your lesson explanation here..."
            />
          </div>
        ) : (
          <div className="mb-4">
            <div
              className="min-h-[100px] p-4 border border-gray-300 rounded-lg bg-gray-50"
              dangerouslySetInnerHTML={{
                __html:
                  formData.explanation ||
                  '<p class="text-gray-500 italic">No explanation provided</p>'
              }}
            />
          </div>
        )}

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

          <div>
            <label className="label">
              <span className="label-text">XP Reward</span>
            </label>
            <input
              type="number"
              name="exp"
              value={formData.exp || 10}
              onChange={handleInputChange}
              disabled={!isEditing && !isAddingNew}
              className="input input-bordered w-full mb-2"
              placeholder="XP earned for completing this lesson"
              min="1"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              XP points awarded when this lesson is completed
            </p>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same... */}
      {!isEditing && !isAddingNew && selectedLesson && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Lesson Questions</h4>
            <button className="btn btn-sm btn-outline" onClick={() => setIsManagingQuestions(true)}>
              Manage Questions
            </button>
          </div>

          {lessonQuestions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonQuestions.map((q) => (
                    <tr key={q.id}>
                      <td className="max-w-xs truncate">{q.question}</td>
                      <td>
                        <div className="flex flex-col gap-1 text-xs">
                          <span>A: {q.option_a}</span>
                          <span>B: {q.option_b}</span>
                          {q.option_c && <span>C: {q.option_c}</span>}
                          {q.option_d && <span>D: {q.option_d}</span>}
                        </div>
                      </td>
                      <td>{q.correct_answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No questions for this lesson</p>
          )}
        </div>
      )}

      {!isEditing && !isAddingNew && selectedLesson && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Exercises</h4>
            <button className="btn btn-sm btn-primary" onClick={onAddNewExercise}>
              Add Exercise
            </button>
          </div>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    selectedLesson?.id === exercise.id ? 'border-2 border-primary' : ''
                  }`}
                  onClick={() => onSelectExercise(exercise)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h5 className="card-title text-base">{exercise.title}</h5>
                      <div className="flex gap-1">
                        {exercise.difficulty && (
                          <span className="badge badge-sm">{exercise.difficulty}</span>
                        )}
                        {exercise.type && (
                          <span className="badge badge-sm badge-outline">{exercise.type}</span>
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
            <p className="text-center text-gray-500 py-4">No exercises for this lesson</p>
          )}
        </div>
      )}

      {selectedLesson && (
        <LessonQuestionManager
          lesson={selectedLesson}
          questions={lessonQuestions}
          isOpen={isManagingQuestions}
          onClose={() => setIsManagingQuestions(false)}
          onQuestionsUpdated={() => {
            if (selectedLesson) {
              onQuestionsUpdated(selectedLesson.id)
            }
          }}
          setDbMessage={setDbMessage}
        />
      )}
    </>
  )
}

export default LessonEditor
