import React from 'react'
import { Lesson } from '../../../types/database'

interface LessonsListProps {
  lessons: Lesson[]
  selectedLesson: Lesson | null
  onSelectLesson: (lesson: Lesson) => void
  onAddNew: () => void
}

const LessonsList: React.FC<LessonsListProps> = ({
  lessons,
  selectedLesson,
  onSelectLesson,
  onAddNew
}) => {
  return (
    <div className="w-full bg-base-200 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Lessons</h3>
        <button className="btn btn-sm btn-primary" onClick={onAddNew}>
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
                  onClick={() => onSelectLesson(lesson)}
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
  )
}

export default LessonsList
