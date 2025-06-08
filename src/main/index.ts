import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { runMigrations } from './migrations'
import { setupDictionaryHandlers } from './dictionary'
import { setupDatabases } from './database/setup'
import { setupUserHandlers, shouldShowSetup } from './handlers/userHandlers'
import { setupLessonHandlers } from './handlers/lessonHandlers'
import { setupExerciseHandlers } from './handlers/exerciseHandlers'
import { setupQuestionHandlers } from './handlers/questionHandlers'
import { setupUpdaterHandlers, checkForUpdatesOnStartup } from './handlers/updaterHandlers'
import { createMenu } from './menu/setup'
import { createWindow } from './window/setup'
import { setupProtocolHandlers } from './protocol/setup'

let mainWindow: BrowserWindow

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Setup databases
  const { userDb, lessonDb } = setupDatabases()

  // Setup protocol handlers
  setupProtocolHandlers()

  // Setup all IPC handlers
  setupDictionaryHandlers()
  setupUserHandlers(userDb)
  setupLessonHandlers(lessonDb)
  setupExerciseHandlers(lessonDb)
  setupQuestionHandlers(lessonDb)

  // Run migrations
  runMigrations()

  // Check if setup is needed
  const needsSetup = shouldShowSetup(userDb)

  // Create main window
  mainWindow = createWindow(needsSetup)

  // Setup updater handlers
  setupUpdaterHandlers(mainWindow)

  // Create menu
  createMenu(mainWindow)

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow(needsSetup)
    }
  })

  // Check for updates after app is ready
  checkForUpdatesOnStartup()
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
