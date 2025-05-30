import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/app_logo.png?asset'
import Database from 'better-sqlite3'
import { setupDictionaryHandlers } from './dictionary'
import { existsSync, copyFileSync, mkdirSync } from 'fs'
import { runMigrations } from './migrations'
import { v4 as uuidv4 } from 'uuid'
import { protocol } from 'electron'
import path from 'path'
import url from 'url'

// Define interface for table information
interface TableInfo {
  name: string
}

// Configure auto-updater
autoUpdater.autoDownload = false // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = false

let mainWindow: BrowserWindow

// Paths for databases
const userDataPath = app.getPath('userData')
const userDbPath = join(userDataPath, 'UserData.db')
const lessonDbPath = join(userDataPath, 'japanolearn.db')
const dictionaryDbPath = join(userDataPath, 'jmdict.sqlite')

// Add this near the top of your file to define image storage paths
const questionImagesPath = join(userDataPath, 'question_images')

// Create the directory if it doesn't exist
if (!existsSync(questionImagesPath)) {
  mkdirSync(questionImagesPath, { recursive: true })
}

// Check if lesson database exists, if not, copy from resources
const resourceLessonDbPath = join(__dirname, '../../resources/japanolearn.db')
const resourceDictionaryDbPath = join(__dirname, '../../resources/jmdict.sqlite')

if (!existsSync(lessonDbPath) && existsSync(resourceLessonDbPath)) {
  copyFileSync(resourceLessonDbPath, lessonDbPath)
}

// Add dictionary database copy logic - same pattern as lesson database
if (!existsSync(dictionaryDbPath) && existsSync(resourceDictionaryDbPath)) {
  console.log('Copying dictionary database to user data directory...')
  copyFileSync(resourceDictionaryDbPath, dictionaryDbPath)
}

// Initialize databases
const userDb = new Database(userDbPath)
const lessonDb = new Database(lessonDbPath)

// Add this near the top of your file, after initializing the databases
console.log('User database path:', userDbPath)
console.log('Lesson database path:', lessonDbPath)
console.log('Resource lesson database path:', resourceLessonDbPath)
console.log('Lesson database exists:', existsSync(lessonDbPath))
console.log('Dictionary database path:', dictionaryDbPath)
console.log('Resource dictionary database path:', resourceDictionaryDbPath)
console.log('Dictionary database exists:', existsSync(dictionaryDbPath))

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

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-not-available', () => {
  console.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err)
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version)

  // Show update dialog
  dialog
    .showMessageBox(mainWindow, {
      type: 'question',
      title: '🎉 Update Available',
      message: `JapanoLearn ${info.version} is now available!`,
      detail: `You're currently using version ${app.getVersion()}.\n\nWould you like to download and install this update?`,
      buttons: ['📥 Update Now', '⏰ Update Later'],
      defaultId: 0,
      cancelId: 1
    })
    .then((result) => {
      if (result.response === 0) {
        // User clicked "Update Now" - show progress dialog immediately
        showDownloadProgressDialog()
        autoUpdater.downloadUpdate()
      } else {
        // User clicked "Update Later"
        console.log('User chose to update later')
      }
    })
})

// Add this new function to show the progress dialog
function showDownloadProgressDialog(): void {
  let progressWindow: BrowserWindow | null = null

  // Create progress window
  progressWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true, // ← Allow closing
    alwaysOnTop: true,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Create HTML content for the progress window
  const progressHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Downloading Update</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
          margin: 0
          padding: 20px
          background: #f5f5f5
          display: flex
          flex-direction: column
          justify-content: center
          height: 160px
        }
        .container {
          text-align: center
        }
        .title {
          font-size: 18px
          font-weight: 600
          margin-bottom: 20px
          color: #333
        }
        .progress-container {
          background: #e0e0e0
          border-radius: 10px
          height: 20px
          margin: 20px 0
          overflow: hidden
        }
        .progress-bar {
          background: linear-gradient(90deg, #4CAF50, #45a049)
          height: 100%
          width: 0%
          transition: width 0.3s ease
          border-radius: 10px
        }
        .progress-text {
          font-size: 14px
          color: #666
          margin-top: 10px
        }
        .status {
          font-size: 12px
          color: #888
          margin-top: 5px
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">📥 Downloading Update</div>
        <div class="progress-container">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="progress-text" id="progressText">0%</div>
        <div class="status" id="statusText">Preparing download...</div>
      </div>
    </body>
    </html>
  `

  progressWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(progressHTML)}`)

  // Progress handler
  const progressHandler = (progressObj: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  }): void => {
    if (!progressWindow) return

    const percent = Math.round(progressObj.percent)
    const speed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(1)
    const transferred = (progressObj.transferred / 1024 / 1024).toFixed(1)
    const total = (progressObj.total / 1024 / 1024).toFixed(1)

    console.log(`Download progress: ${percent}% - ${transferred}MB / ${total}MB (${speed} MB/s)`)

    progressWindow.webContents.executeJavaScript(`
      document.getElementById('progressBar').style.width = '${percent}%';
      document.getElementById('progressText').textContent = '${percent}%';
      document.getElementById('statusText').textContent = '${transferred}MB / ${total}MB (${speed} MB/s)';
    `)

    if (percent >= 100) {
      progressWindow.webContents.executeJavaScript(`
        document.getElementById('statusText').textContent = 'Verifying update...';
      `)
    }
  }
  // Download complete handler - THIS IS THE KEY FIX
  const downloadedHandler = (): void => {
    console.log('update-downloaded event fired!')

    // FORCE CLOSE the progress window first
    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.destroy() // Use destroy() instead of close()
      progressWindow = null
    }

    // Wait a moment for window to fully close, then show dialog
    setTimeout(() => {
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: '✅ Update Ready',
          message: 'Update has been downloaded successfully!',
          detail: 'The application will restart to complete the installation.',
          buttons: ['🔄 Restart Now', '⏰ Restart Later'],
          defaultId: 0,
          cancelId: 1
        })
        .then((result) => {
          if (result.response === 0) {
            console.log('User clicked Restart Now')
            autoUpdater.quitAndInstall()
          } else {
            console.log('User chose to restart later')
          }
        })
        .catch((err) => {
          console.error('Error showing restart dialog:', err)
        })
    }, 100) // Small delay to ensure window is fully closed
  }

  // Error handler
  const errorHandler = (err: Error): void => {
    console.error('Download error:', err)
    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.destroy()
      progressWindow = null
    }
    dialog.showErrorBox('Update Error', `Failed to download update: ${err.message}`)
  }
  // Attach event listeners
  autoUpdater.on('download-progress', progressHandler)
  autoUpdater.once('update-downloaded', downloadedHandler) // Use once() to prevent multiple calls
  autoUpdater.once('error', errorHandler)

  // Clean up when progress window is manually closed
  progressWindow.on('closed', () => {
    autoUpdater.removeListener('download-progress', progressHandler)
    autoUpdater.removeListener('update-downloaded', downloadedHandler)
    autoUpdater.removeListener('error', errorHandler)
    progressWindow = null
  })
}

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

// Add this function before createWindow
function shouldShowSetup(): boolean {
  try {
    const stmt = userDb.prepare('SELECT COUNT(*) as count FROM users')
    const result = stmt.get() as { count: number }
    console.log('User count in database:', result.count)
    return result.count === 0
  } catch (error) {
    console.error('Error checking if setup is needed:', error)
    return true // Default to showing setup if there's an error
  }
}

// Create application menu with update check
function createMenu(): void {
  const template = [
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: (): void => {
            if (app.isPackaged) {
              autoUpdater.checkForUpdates()
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Development Mode',
                message: 'Updates are only available in production builds.',
                buttons: ['OK']
              })
            }
          }
        },
        {
          label: 'About',
          click: (): void => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About JapanoLearn',
              message: `JapanoLearn v${app.getVersion()}`,
              detail: 'Learn Japanese with ease!',
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
// Then modify your createWindow function to use this information
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
    const needsSetup = shouldShowSetup()
    console.log('Needs setup:', needsSetup)

    // Add the setup query parameter to tell the renderer which screen to show
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    url.searchParams.set('setup', needsSetup ? 'true' : 'false')
    mainWindow.loadURL(url.toString())
  } else {
    // For production, we'll pass a query parameter to the HTML file
    const needsSetup = shouldShowSetup()
    console.log('Needs setup:', needsSetup)

    const htmlPath = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(htmlPath, {
      query: {
        setup: needsSetup ? 'true' : 'false'
      }
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  setupDictionaryHandlers()

  // Register protocol handler
  protocol.registerFileProtocol('app-image', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('app-image://'.length))
    callback({ path: filePath })
  })

  // running Migration
  runMigrations()
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  createMenu()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Check for updates after app is ready (only in production)
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates()
    }, 3000) // Wait 3 seconds after startup
  }
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
    // Handle image upload if provided
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
    // Handle image upload if a new image is provided
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
    // Handle image upload if provided
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
    // Handle image upload if a new image is provided
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

// Helper function to handle image uploads
function saveQuestionImage(imagePath: string | null): string | null {
  if (!imagePath) return null

  // If it's already a stored image path, return it as is
  if (imagePath.startsWith('question_images/')) {
    return imagePath
  }

  try {
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

// Add a new IPC handler for image selection
ipcMain.handle('select-image', async () => {
  const { dialog } = require('electron')
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'] }]
  })

  if (result.canceled) {
    return { success: false, canceled: true }
  }

  return { success: true, filePath: result.filePaths[0] }
})

// Add this handler to get the user data path for image display
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData')
})

// Add this IPC handler
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

// Handle manual update check from renderer
ipcMain.handle('check-for-updates-manual', async () => {
  if (app.isPackaged) {
    autoUpdater.checkForUpdates()
    return 'Checking for updates...'
  } else {
    return 'Updates only work in production builds'
  }
})
