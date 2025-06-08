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

  // Load the appropriate URL/file
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Needs setup:', shouldShowSetup)
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    url.searchParams.set('setup', shouldShowSetup ? 'true' : 'false')
    mainWindow.loadURL(url.toString())
  } else {
    console.log('Needs setup:', shouldShowSetup)
    const htmlPath = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(htmlPath, {
      query: {
        setup: shouldShowSetup ? 'true' : 'false'
      }
    })
  }

  // Setup quit handler
  ipcMain.on('quit-app', () => {
    app.quit()
  })

  return mainWindow
}
