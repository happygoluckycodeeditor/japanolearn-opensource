import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'

export function runMigrations(): void {
  const userDataPath = app.getPath('userData')
  const lessonDbPath = join(userDataPath, 'japanolearn.db')

  try {
    const db = new Database(lessonDbPath)

    // Check if image_path column exists in lesson_questions
    const lessonQuestionsColumns = db.prepare(`PRAGMA table_info(lesson_questions)`).all() as {
      name: string
    }[]
    if (!lessonQuestionsColumns.some((col) => col.name === 'image_path')) {
      console.log('Adding image_path column to lesson_questions table')
      db.prepare('ALTER TABLE lesson_questions ADD COLUMN image_path TEXT').run()
    }

    // Check if image_path column exists in exercise_questions
    const exerciseQuestionsColumns = db.prepare(`PRAGMA table_info(exercise_questions)`).all() as {
      name: string
    }[]
    if (!exerciseQuestionsColumns.some((col) => col.name === 'image_path')) {
      console.log('Adding image_path column to exercise_questions table')
      db.prepare('ALTER TABLE exercise_questions ADD COLUMN image_path TEXT').run()
    }

    // Check if exp column exists in lessons table
    const lessonsColumns = db.prepare(`PRAGMA table_info(lessons)`).all() as {
      name: string
    }[]
    if (!lessonsColumns.some((col) => col.name === 'exp')) {
      console.log('Adding exp column to lessons table')
      db.prepare('ALTER TABLE lessons ADD COLUMN exp INTEGER DEFAULT 10').run()
    }

    // Check if exp column exists in exercises table
    const exercisesColumns = db.prepare(`PRAGMA table_info(exercises)`).all() as {
      name: string
    }[]
    if (!exercisesColumns.some((col) => col.name === 'exp')) {
      console.log('Adding exp column to exercises table')
      db.prepare('ALTER TABLE exercises ADD COLUMN exp INTEGER DEFAULT 5').run()
    }

    db.close()
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Error running database migrations:', error)
  }
}
