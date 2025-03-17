import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Database from 'better-sqlite3'

// Initialize database in the user data directory
const userDb = new Database(join(app.getPath('userData'), 'UserData.db'))
const lessonDb = new Database(join(app.getPath('userData'), 'japanolearn.db'))

// User database setup
userDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

// Lesson database setup (example)
lessonDb.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL
  )
`)

// Lesson database setup
lessonDb.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    order_index INTEGER NOT NULL
  )
`)

// Practice tests table
lessonDb.exec(`
  CREATE TABLE IF NOT EXISTS practice_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  )
`)

// Exercises table
lessonDb.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    practice_test_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    options TEXT,  /* JSON string for multiple choice options */
    exercise_type TEXT NOT NULL, /* 'multiple-choice', 'fill-blank', etc. */
    FOREIGN KEY (practice_test_id) REFERENCES practice_tests(id)
  )
`)


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

// Get all lessons
ipcMain.handle('get-lessons', () => {
  try {
    const stmt = lessonDb.prepare('SELECT * FROM lessons ORDER BY order_index')
    const lessons = stmt.all()
    return { success: true, lessons }
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// Get practice tests for a lesson
ipcMain.handle('get-practice-tests', (_event, lessonId) => {
  try {
    const stmt = lessonDb.prepare('SELECT * FROM practice_tests WHERE lesson_id = ?')
    const tests = stmt.all(lessonId)
    return { success: true, tests }
  } catch (error) {
    console.error('Error fetching practice tests:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// Get exercises for a practice test
ipcMain.handle('get-exercises', (_event, practiceTestId) => {
  try {
    const stmt = lessonDb.prepare('SELECT * FROM exercises WHERE practice_test_id = ?')
    const exercises = stmt.all(practiceTestId)
    return { success: true, exercises }
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// Save user progress
ipcMain.handle('save-progress', (_event, { userId, lessonId, completed }) => {
  try {
    const stmt = userDb.prepare(`
      INSERT INTO user_progress (user_id, lesson_id, completed, last_accessed)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, lesson_id) 
      DO UPDATE SET completed = ?, last_accessed = CURRENT_TIMESTAMP
    `)
    stmt.run(userId, lessonId, completed, completed)
    return { success: true }
  } catch (error) {
    console.error('Error saving progress:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// Save exercise result
ipcMain.handle('save-exercise-result', (_event, { userId, exerciseId, isCorrect, userAnswer }) => {
  try {
    const stmt = userDb.prepare(`
      INSERT INTO exercise_results (user_id, exercise_id, is_correct, user_answer)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(userId, exerciseId, isCorrect, userAnswer)
    return { success: true }
  } catch (error) {
    console.error('Error saving exercise result:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
