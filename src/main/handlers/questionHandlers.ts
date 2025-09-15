import { ipcMain, app, dialog } from 'electron'
import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

// Helper function to handle image uploads
function saveQuestionImage(imagePath: string | null): string | null {
  if (!imagePath) return null

  // If it's already a stored image path, return it as is
  if (imagePath.startsWith('question_images/')) {
    return imagePath
  }

  try {
    const userDataPath = app.getPath('userData')
    const questionImagesPath = join(userDataPath, 'question_images')

    // Create the directory if it doesn't exist
    if (!existsSync(questionImagesPath)) {
      mkdirSync(questionImagesPath, { recursive: true })
    }

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}${imagePath.substring(imagePath.lastIndexOf('.'))}`
    const destinationPath = join(questionImagesPath, uniqueFilename)

    // Copy the image to our storage location
    copyFileSync(imagePath, destinationPath)

    // Return the relative path to be stored in the database
    return `question_images/${uniqueFilename}`
  } catch (error) {
    console.error('Error saving image:', error)
    return null
  }
}

export function setupQuestionHandlers(lessonDb: Database.Database): void {
  // Exercise Questions
  ipcMain.handle('get-exercise-questions', (_event, exerciseId) => {
    try {
      const stmt = lessonDb.prepare('SELECT * FROM exercise_questions WHERE exercise_id = ?')
      const questions = stmt.all(exerciseId)
      return { success: true, questions }
    } catch (error) {
      console.error('Error fetching exercise questions:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('add-exercise-question', (_event, questionData) => {
    try {
      const imagePath = saveQuestionImage(questionData.image_path)

      const stmt = lessonDb.prepare(`
        INSERT INTO exercise_questions (
          exercise_id, question, option_a, option_b, option_c, option_d, 
          correct_answer, explanation, image_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        questionData.exercise_id,
        questionData.question,
        questionData.option_a,
        questionData.option_b,
        questionData.option_c || null,
        questionData.option_d || null,
        questionData.correct_answer,
        questionData.explanation || null,
        imagePath
      )

      const newQuestion = lessonDb
        .prepare('SELECT * FROM exercise_questions WHERE id = ?')
        .get(result.lastInsertRowid)

      return { success: true, question: newQuestion }
    } catch (error) {
      console.error('Error adding exercise question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('update-exercise-question', (_event, questionData) => {
    try {
      const imagePath = saveQuestionImage(questionData.image_path)

      const stmt = lessonDb.prepare(`
        UPDATE exercise_questions 
        SET question = ?, option_a = ?, option_b = ?, option_c = ?, 
            option_d = ?, correct_answer = ?, explanation = ?, image_path = ?
        WHERE id = ?
      `)

      stmt.run(
        questionData.question,
        questionData.option_a,
        questionData.option_b,
        questionData.option_c || null,
        questionData.option_d || null,
        questionData.correct_answer,
        questionData.explanation || null,
        imagePath,
        questionData.id
      )

      const updatedQuestion = lessonDb
        .prepare('SELECT * FROM exercise_questions WHERE id = ?')
        .get(questionData.id)

      return { success: true, question: updatedQuestion }
    } catch (error) {
      console.error('Error updating exercise question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('delete-exercise-question', (_event, questionId) => {
    try {
      lessonDb.prepare('DELETE FROM exercise_questions WHERE id = ?').run(questionId)
      return { success: true }
    } catch (error) {
      console.error('Error deleting exercise question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Lesson Questions
  ipcMain.handle('get-lesson-questions', (_event, lessonId) => {
    try {
      const stmt = lessonDb.prepare('SELECT * FROM lesson_questions WHERE lesson_id = ?')
      const questions = stmt.all(lessonId)
      return { success: true, questions }
    } catch (error) {
      console.error('Error fetching lesson questions:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('add-lesson-question', (_event, questionData) => {
    try {
      const imagePath = saveQuestionImage(questionData.image_path)

      const stmt = lessonDb.prepare(`
        INSERT INTO lesson_questions (
          lesson_id, question, option_a, option_b, option_c, option_d, 
          correct_answer, explanation, image_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        questionData.lesson_id,
        questionData.question,
        questionData.option_a,
        questionData.option_b,
        questionData.option_c || '',
        questionData.option_d || '',
        questionData.correct_answer,
        questionData.explanation || null,
        imagePath
      )

      const newQuestion = lessonDb
        .prepare('SELECT * FROM lesson_questions WHERE id = ?')
        .get(result.lastInsertRowid)

      return { success: true, question: newQuestion }
    } catch (error) {
      console.error('Error adding lesson question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('update-lesson-question', (_event, questionData) => {
    try {
      const imagePath = saveQuestionImage(questionData.image_path)

      const stmt = lessonDb.prepare(`
        UPDATE lesson_questions 
        SET question = ?, option_a = ?, option_b = ?, option_c = ?, 
            option_d = ?, correct_answer = ?, explanation = ?, image_path = ?
        WHERE id = ?
      `)

      stmt.run(
        questionData.question,
        questionData.option_a,
        questionData.option_b,
        questionData.option_c || '',
        questionData.option_d || '',
        questionData.correct_answer,
        questionData.explanation || null,
        imagePath,
        questionData.id
      )

      const updatedQuestion = lessonDb
        .prepare('SELECT * FROM lesson_questions WHERE id = ?')
        .get(questionData.id)

      return { success: true, question: updatedQuestion }
    } catch (error) {
      console.error('Error updating lesson question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  ipcMain.handle('delete-lesson-question', (_event, questionId) => {
    try {
      lessonDb.prepare('DELETE FROM lesson_questions WHERE id = ?').run(questionId)
      return { success: true }
    } catch (error) {
      console.error('Error deleting lesson question:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'An unknown error occurred' }
      }
    }
  })

  // Image handling
  ipcMain.handle('select-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'] }]
    })

    if (result.canceled) {
      return { success: false, canceled: true }
    }

    return { success: true, filePath: result.filePaths[0] }
  })

  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData')
  })

  ipcMain.handle('get-secure-image-url', async (_, imagePath) => {
    if (!imagePath) return ''

    // For stored images (relative path)
    if (imagePath.startsWith('question_images/')) {
      const userDataPath = app.getPath('userData')
      const absolutePath = path.join(userDataPath, imagePath)
      return `app-image://${absolutePath}`
    }

    // For newly selected images (absolute path)
    return `app-image://${imagePath}`
  })

  ipcMain.handle('get-secure-audio-url', async (_, audioPath) => {
    if (!audioPath) return ''

    // For audio files, construct path to user data directory
    const userDataPath = app.getPath('userData')
    const absolutePath = path.join(userDataPath, audioPath)
    return `app-audio://${absolutePath}`
  })
}
