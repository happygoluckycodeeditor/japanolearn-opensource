import { BrowserWindow, shell, ipcMain, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/app_logo.png?asset'

export function createWindow(shouldShowSetup: boolean): BrowserWindow {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Japanolearn',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the appropriate URL/file
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Needs setup:', shouldShowSetup)
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    url.searchParams.set('setup', shouldShowSetup ? 'true' : 'false')
    mainWindow.loadURL(url.toString())
  } else {
    console.log('Needs setup:', shouldShowSetup)
    // Use app:// protocol for web-like origin (fixes YouTube embeds)
    const appUrl = new URL('app://index.html')
    appUrl.searchParams.set('setup', shouldShowSetup ? 'true' : 'false')
    mainWindow.loadURL(appUrl.toString())
  }

  // Setup quit handler
  ipcMain.on('quit-app', () => {
    app.quit()
  })

  // Open dev tools only in development mode
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }
  
  // Enable console in production for debugging
  if (!is.dev) {
    mainWindow.webContents.on('console-message', (_, level, message) => {
      console.log(`Console [${level}]: ${message}`)
    })
    
    // Add keyboard shortcut to open dev tools in production (Ctrl/Cmd+Shift+I)
    mainWindow.webContents.on('before-input-event', (_, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i' && input.type === 'keyDown') {
        mainWindow.webContents.toggleDevTools()
      }
      if (input.meta && input.shift && input.key.toLowerCase() === 'i' && input.type === 'keyDown') {
        mainWindow.webContents.toggleDevTools()
      }
    })
  }

  return mainWindow
}
