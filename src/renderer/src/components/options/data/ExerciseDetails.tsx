import React from 'react'
import { Exercise, ExerciseQuestion } from '../../../types/database'

interface ExerciseDetailsProps {
  exercise: Exercise
  questions: ExerciseQuestion[]
  onEdit: () => void
  onDelete: () => void
  onManageQuestions: () => void
}

const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({
  exercise,
  questions,
  onEdit,
  onDelete,
  onManageQuestions
}) => {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Exercise Details</h4>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-sm btn-error" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="bg-base-100 p-4 rounded-lg mb-4">
        <div className="mb-2">
          <span className="font-semibold">ID:</span> {exercise.id}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Title:</span> {exercise.title}
        </div>
        {exercise.description && (
          <div className="mb-2">
            <span className="font-semibold">Description:</span> {exercise.description}
          </div>
        )}
        <div className="mb-2">
          <span className="font-semibold">Difficulty:</span>{' '}
          {exercise.difficulty || 'Not specified'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Type:</span> {exercise.type || 'Not specified'}
        </div>
        {/* NEW: Display XP value */}
        <div className="mb-2">
          <span className="font-semibold">XP Reward:</span>{' '}
          <span className="badge badge-primary">{exercise.exp || 5} XP</span>
        </div>
      </div>

      {/* Exercise Questions Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold">Exercise Questions</h5>
          <button className="btn btn-sm btn-outline" onClick={onManageQuestions}>
            Manage Questions
          </button>
        </div>

        {questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.question}</td>
                    <td>{q.correct_answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No questions for this exercise</p>
        )}
      </div>
    </div>
  )
}

export default ExerciseDetails
