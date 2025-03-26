import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Database from 'better-sqlite3'
import { setupDictionaryHandlers } from './dictionary'

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
