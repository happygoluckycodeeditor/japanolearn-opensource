import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/app_logo.png?asset'
import Database from 'better-sqlite3'
import { setupDictionaryHandlers } from './dictionary'

// Define interface for table information
interface TableInfo {
  name: string
}

// Paths for databases
const userDataPath = app.getPath('userData')
const userDbPath = join(userDataPath, 'UserData.db')
const lessonDbPath = join(userDataPath, 'japanolearn.db')

// Check if lesson database exists, if not, copy from resources
const resourceLessonDbPath = join(__dirname, '../../resources/japanolearn.db')
import { existsSync, copyFileSync } from 'fs'

if (!existsSync(lessonDbPath) && existsSync(resourceLessonDbPath)) {
  copyFileSync(resourceLessonDbPath, lessonDbPath)
}
// Initialize databases
const userDb = new Database(userDbPath)
const lessonDb = new Database(lessonDbPath)

// Add this near the top of your file, after initializing the databases
console.log('User database path:', userDbPath)
console.log('Lesson database path:', lessonDbPath)
console.log('Resource lesson database path:', resourceLessonDbPath)
console.log('Lesson database exists:', existsSync(lessonDbPath))

// Add this after initializing lessonDb
const tables = lessonDb
  .prepare(
    `
  SELECT name FROM sqlite_master WHERE type='table'
`
  )
  .all() as TableInfo[]
console.log(
  'Tables in the database:',
  tables.map((t: TableInfo) => t.name)
)

// User database setup - this one we still create dynamically
userDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

userDb.exec(`
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`)

userDb.exec(`
  CREATE TABLE IF NOT EXISTS exercise_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    user_answer TEXT,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`)

// No need to create tables for lessonDb as it's pre-populated
// Handle save-username IPC event
ipcMain.handle('save-username', (_event, username) => {
  try {
    const stmt = userDb.prepare('INSERT INTO users (username) VALUES (?)')
    const result = stmt.run(username)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    console.error('Error saving username:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    } else {
      return { success: false, error: 'An unknown error occurred' }
    }
  }
})

// Add this handler to check database content
ipcMain.handle('get-users', () => {
  try {
    const stmt = userDb.prepare('SELECT * FROM users')
    const users = stmt.all()
    return { success: true, users }
  } catch (error) {
    console.error('Error fetching users:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    } else {
      return { success: false, error: 'An unknown error occurred with DB Fetching' }
    }
  }
})

// Add this handler to reset users table
ipcMain.handle('reset-database', () => {
  try {
    userDb.prepare('DELETE FROM users').run()
    return { success: true, message: 'Database reset successfully' }
  } catch (error) {
    console.error('Error resetting database:', error)
    return { success: false, error: 'Database reset was not successful' }
  }
})

// Make sure this handler is added before the app.whenReady() call
ipcMain.handle('update-username', (_event, { userId, newUsername }) => {
  try {
    const stmt = userDb.prepare('UPDATE users SET username = ? WHERE id = ?')
    const result = stmt.run(newUsername, userId)

    if (result.changes > 0) {
      return { success: true, message: 'Username updated successfully' }
    } else {
      return { success: false, error: 'No user found with that ID' }
    }
  } catch (error) {
    console.error('Error updating username:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    } else {
      return { success: false, error: 'An unknown error occurred' }
    }
  }
})

// Add these IPC handlers for lesson management
ipcMain.handle('get-lessons', () => {
  try {
    // Check what tables exist
    const tables = lessonDb
      .prepare(
        `
      SELECT name FROM sqlite_master WHERE type='table'
    `
      )
      .all() as TableInfo[]

    console.log(
      'Available tables:',
      tables.map((t: TableInfo) => t.name)
    )

    // Try to query the lessons table, whatever it might be named
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

ipcMain.handle('add-lesson', (_event, lessonData) => {
  try {
    const stmt = lessonDb.prepare(`
      INSERT INTO lessons (title, description, explanation, video_url, level, category, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      lessonData.title,
      lessonData.description,
      lessonData.explanation || null,
      lessonData.video_url || null,
      lessonData.level || null,
      lessonData.category || null,
      lessonData.order_index || null
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

ipcMain.handle('update-lesson', (_event, lessonData) => {
  try {
    const stmt = lessonDb.prepare(`
      UPDATE lessons 
      SET title = ?, description = ?, explanation = ?, video_url = ?, 
          level = ?, category = ?, order_index = ?
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
      lessonData.id
    )

    // Fetch the updated lesson
    const updatedLesson = lessonDb.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonData.id)

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

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Japanolearn', //Name of the application
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  setupDictionaryHandlers()
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Quitting the app when the quit button is clicked
ipcMain.on('quit-app', () => {
  app.quit()
})
// Quitting the app when the quit button is clicked
ipcMain.on('quit-app', () => {
  app.quit()
})

// Add these IPC handlers after your existing lesson management handlers

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

// Get questions for a specific exercise
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

// Add a new exercise
ipcMain.handle('add-exercise', (_event, exerciseData) => {
  try {
    const stmt = lessonDb.prepare(`
      INSERT INTO exercises (lesson_id, title, description, difficulty, type)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      exerciseData.lesson_id,
      exerciseData.title,
      exerciseData.description || null,
      exerciseData.difficulty || null,
      exerciseData.type || null
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
      SET title = ?, description = ?, difficulty = ?, type = ?
      WHERE id = ?
    `)

    stmt.run(
      exerciseData.title,
      exerciseData.description || null,
      exerciseData.difficulty || null,
      exerciseData.type || null,
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

// Add a new exercise question
ipcMain.handle('add-exercise-question', (_event, questionData) => {
  try {
    const stmt = lessonDb.prepare(`
      INSERT INTO exercise_questions (
        exercise_id, question, option_a, option_b, option_c, option_d, 
        correct_answer, explanation
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      questionData.exercise_id,
      questionData.question,
      questionData.option_a,
      questionData.option_b,
      questionData.option_c || null,
      questionData.option_d || null,
      questionData.correct_answer,
      questionData.explanation || null
    )

    // Fetch the newly created question
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

// Update an existing exercise question
ipcMain.handle('update-exercise-question', (_event, questionData) => {
  try {
    const stmt = lessonDb.prepare(`
      UPDATE exercise_questions 
      SET question = ?, option_a = ?, option_b = ?, option_c = ?, 
          option_d = ?, correct_answer = ?, explanation = ?
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
      questionData.id
    )

    // Fetch the updated question
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

// Delete an exercise question
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

//IPC handlers for lesson question management

//Get Lesson questions
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

// Add a new lesson question
ipcMain.handle('add-lesson-question', (_event, questionData) => {
  try {
    const stmt = lessonDb.prepare(`
      INSERT INTO lesson_questions (
        lesson_id, question, option_a, option_b, option_c, option_d, 
        correct_answer, explanation
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Ensure we're not passing null for option_c and option_d
    const result = stmt.run(
      questionData.lesson_id,
      questionData.question,
      questionData.option_a,
      questionData.option_b,
      questionData.option_c || '', // Use empty string instead of null
      questionData.option_d || '', // Use empty string instead of null
      questionData.correct_answer,
      questionData.explanation || null
    )

    // Fetch the newly created question
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

// Update an existing lesson question
ipcMain.handle('update-lesson-question', (_event, questionData) => {
  try {
    const stmt = lessonDb.prepare(`
      UPDATE lesson_questions 
      SET question = ?, option_a = ?, option_b = ?, option_c = ?, 
          option_d = ?, correct_answer = ?, explanation = ?
      WHERE id = ?
    `)

    stmt.run(
      questionData.question,
      questionData.option_a,
      questionData.option_b,
      questionData.option_c || '', // Use empty string instead of null
      questionData.option_d || '', // Use empty string instead of null
      questionData.correct_answer,
      questionData.explanation || null,
      questionData.id
    )

    // Fetch the updated question
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

// Delete a lesson question
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
