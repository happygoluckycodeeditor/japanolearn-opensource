import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function setupExerciseHandlers(lessonDb: Database.Database): void {
  // Get exercises for a specific lesson
  ipcMain.handle('get-exercises', (_event, lessonId) => {
    try {
      const stmt = lessonDb.prepare('SELECT * FROM exercises WHERE lesson_id = ? ORDER BY id ASC')
      const exercises = stmt.all(lessonId)
      return { success: true, exercises }
    } catch (error) {
      console.error('Error fetching exercises:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Add a new exercise
  ipcMain.handle('add-exercise', (_event, exerciseData) => {
    try {
      const stmt = lessonDb.prepare(`
        INSERT INTO exercises (lesson_id, title, description, difficulty, type, exp)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        exerciseData.lesson_id,
        exerciseData.title,
        exerciseData.description || null,
        exerciseData.difficulty || null,
        exerciseData.type || null,
        exerciseData.exp || 5
      )

      // Fetch the newly created exercise
      const newExercise = lessonDb
        .prepare('SELECT * FROM exercises WHERE id = ?')
        .get(result.lastInsertRowid)

      return { success: true, exercise: newExercise }
    } catch (error) {
      console.error('Error adding exercise:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Update an existing exercise
  ipcMain.handle('update-exercise', (_event, exerciseData) => {
    try {
      const stmt = lessonDb.prepare(`
        UPDATE exercises 
        SET title = ?, description = ?, difficulty = ?, type = ?, exp = ?
        WHERE id = ?
      `)

      stmt.run(
        exerciseData.title,
        exerciseData.description || null,
        exerciseData.difficulty || null,
        exerciseData.type || null,
        exerciseData.exp || 5,
        exerciseData.id
      )

      // Fetch the updated exercise
      const updatedExercise = lessonDb
        .prepare('SELECT * FROM exercises WHERE id = ?')
        .get(exerciseData.id)

      return { success: true, exercise: updatedExercise }
    } catch (error) {
      console.error('Error updating exercise:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Delete an exercise
  ipcMain.handle('delete-exercise', (_event, exerciseId) => {
    try {
      // Begin transaction
      lessonDb.prepare('BEGIN TRANSACTION').run()

      try {
        // Delete related exercise questions first
        lessonDb.prepare('DELETE FROM exercise_questions WHERE exercise_id = ?').run(exerciseId)

        // Delete the exercise
        lessonDb.prepare('DELETE FROM exercises WHERE id = ?').run(exerciseId)

        // Commit transaction
        lessonDb.prepare('COMMIT').run()

        return { success: true }
      } catch (error) {
        // Rollback on error
        lessonDb.prepare('ROLLBACK').run()
        throw error
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })
}
