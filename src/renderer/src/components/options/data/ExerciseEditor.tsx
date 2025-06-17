import React, { useState, useEffect } from 'react'
import { Exercise } from '../../../types/database'

interface ExerciseEditorProps {
  selectedExercise: Exercise | null
  isAddingNew: boolean
  isEditing: boolean
  lessonId?: number
  onSave: () => void
  onCancel: () => void
  setDbMessage: (message: { text: string; type: string }) => void
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  selectedExercise,
  isAddingNew,
  isEditing,
  lessonId,
  onSave,
  onCancel,
  setDbMessage
}) => {
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    difficulty: 'Beginner',
    type: 'Multiple Choice',
    lesson_id: lessonId,
    exp: 5 // NEW: Default XP value
  })

  useEffect(() => {
    if (selectedExercise && (isEditing || !isAddingNew)) {
      setFormData(selectedExercise)
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        type: 'Multiple Choice',
        lesson_id: lessonId,
        exp: 5 // NEW: Default XP value for new exercises
      })
    }
  }, [selectedExercise, isAddingNew, isEditing, lessonId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    // Handle number inputs properly
    const processedValue = name === 'exp' ? parseInt(value) || 0 : value
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleSaveExercise = async (): Promise<void> => {
    try {
      if (!formData.title) {
        setDbMessage({ text: 'Exercise title is required', type: 'error' })
        return
      }

      // NEW: Validate XP value
      if (!formData.exp || formData.exp < 1) {
        setDbMessage({ text: 'XP must be at least 1', type: 'error' })
        return
      }

      let result
      if (isAddingNew) {
        result = await window.electron.ipcRenderer.invoke('add-exercise', formData)
      } else if (isEditing) {
        result = await window.electron.ipcRenderer.invoke('update-exercise', {
          id: selectedExercise?.id,
          ...formData
        })
      }

      if (result.success) {
        setDbMessage({
          text: isAddingNew
            ? 'Exercise added successfully!'
            : isEditing
              ? 'Exercise updated successfully!'
              : 'Exercise saved successfully!',
          type: 'success'
        })
        onSave()
      } else {
        setDbMessage({ text: result.error || 'Failed to save exercise', type: 'error' })
      }
    } catch (error) {
      setDbMessage({ text: 'An error occurred while saving the exercise', type: 'error' })
    }
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">
          {isAddingNew ? 'Add New Exercise' : isEditing ? 'Edit Exercise' : 'Exercise Details'}
        </h4>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={handleSaveExercise}>
            Save
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onCancel}>
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
          value={formData.title || ''}
          onChange={handleInputChange}
          className="input input-bordered mb-2"
          placeholder="Exercise title"
        />

        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
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
              value={formData.difficulty || ''}
              onChange={handleInputChange}
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
              value={formData.type || ''}
              onChange={handleInputChange}
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

          {/* NEW: XP Field */}
          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">XP Reward</span>
            </label>
            <input
              type="number"
              name="exp"
              value={formData.exp || 5}
              onChange={handleInputChange}
              className="input input-bordered w-full mb-2"
              placeholder="XP earned for completing this exercise"
              min="1"
              max="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              XP points awarded when this exercise is completed successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExerciseEditor
