import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

interface TableInfo {
  name: string
}

export function setupLessonHandlers(lessonDb: Database.Database): void {
  // Get lessons handler
  ipcMain.handle('get-lessons', () => {
    try {
      // Check what tables exist
      const tables = lessonDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as TableInfo[]

      console.log(
        'Available tables:',
        tables.map((t: TableInfo) => t.name)
      )

      let lessons: unknown[] = []

      // Try with 'lessons' table
      try {
        const stmt = lessonDb.prepare('SELECT * FROM lessons ORDER BY id ASC')
        lessons = stmt.all()
      } catch (e) {
        console.log('No "lessons" table found, trying alternatives...')

        // Try with other possible table names
        const possibleTableNames = ['Lessons', 'lesson', 'LESSONS', 'japanolearn_lessons']

        for (const tableName of possibleTableNames) {
          try {
            if (tables.some((t: TableInfo) => t.name === tableName)) {
              const stmt = lessonDb.prepare(`SELECT * FROM "${tableName}" ORDER BY id ASC`)
              lessons = stmt.all()
              console.log(`Found lessons in table: ${tableName}`)
              break
            }
          } catch (tableError) {
            console.log(`Error querying ${tableName}:`, tableError)
          }
        }
      }

      return { success: true, lessons }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Add lesson handler - UPDATED to include exp
  ipcMain.handle('add-lesson', (_event, lessonData) => {
    try {
      const stmt = lessonDb.prepare(`
        INSERT INTO lessons (title, description, explanation, video_url, level, category, order_index, exp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        lessonData.title,
        lessonData.description,
        lessonData.explanation || null,
        lessonData.video_url || null,
        lessonData.level || null,
        lessonData.category || null,
        lessonData.order_index || null,
        lessonData.exp || 10 // NEW: Include exp field with default value
      )

      // Fetch the newly created lesson
      const newLesson = lessonDb
        .prepare('SELECT * FROM lessons WHERE id = ?')
        .get(result.lastInsertRowid)

      return { success: true, lesson: newLesson }
    } catch (error) {
      console.error('Error adding lesson:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Update lesson handler - UPDATED to include exp
  ipcMain.handle('update-lesson', (_event, lessonData) => {
    try {
      const stmt = lessonDb.prepare(`
        UPDATE lessons 
        SET title = ?, description = ?, explanation = ?, video_url = ?, 
            level = ?, category = ?, order_index = ?, exp = ?
        WHERE id = ?
      `)

      stmt.run(
        lessonData.title,
        lessonData.description,
        lessonData.explanation || null,
        lessonData.video_url || null,
        lessonData.level || null,
        lessonData.category || null,
        lessonData.order_index || null,
        lessonData.exp || 10, // NEW: Include exp field with default value
        lessonData.id
      )

      // Fetch the updated lesson
      const updatedLesson = lessonDb
        .prepare('SELECT * FROM lessons WHERE id = ?')
        .get(lessonData.id)

      return { success: true, lesson: updatedLesson }
    } catch (error) {
      console.error('Error updating lesson:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Delete lesson handler
  ipcMain.handle('delete-lesson', (_event, lessonId) => {
    try {
      // Begin transaction
      lessonDb.prepare('BEGIN TRANSACTION').run()

      try {
        // Delete related lesson questions first
        lessonDb.prepare('DELETE FROM lesson_questions WHERE lesson_id = ?').run(lessonId)

        // Delete related exercises and exercise questions
        const exercises = lessonDb
          .prepare('SELECT id FROM exercises WHERE lesson_id = ?')
          .all(lessonId) as { id: number }[]
        for (const exercise of exercises) {
          lessonDb.prepare('DELETE FROM exercise_questions WHERE exercise_id = ?').run(exercise.id)
        }
        lessonDb.prepare('DELETE FROM exercises WHERE lesson_id = ?').run(lessonId)

        // Delete related vocabulary and grammar points
        lessonDb.prepare('DELETE FROM vocabulary WHERE lesson_id = ?').run(lessonId)
        lessonDb.prepare('DELETE FROM grammar_points WHERE lesson_id = ?').run(lessonId)

        // Finally delete the lesson
        lessonDb.prepare('DELETE FROM lessons WHERE id = ?').run(lessonId)

        // Commit transaction
        lessonDb.prepare('COMMIT').run()

        return { success: true }
      } catch (error) {
        // Rollback on error
        lessonDb.prepare('ROLLBACK').run()
        throw error
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })
}
