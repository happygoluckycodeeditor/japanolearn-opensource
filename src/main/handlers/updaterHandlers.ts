import { app, dialog, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
// No filesystem ops here anymore; DB copy is handled on startup

let mainWindow: BrowserWindow

export function setupUpdaterHandlers(window: BrowserWindow): void {
  mainWindow = window

  // Configure auto-updater
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  if (process.platform === 'win32') {
    autoUpdater.autoInstallOnAppQuit = true
  }

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
          showDownloadProgressDialog()
          autoUpdater.downloadUpdate()
        } else {
          console.log('User chose to update later')
        }
      })
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
}

function showDownloadProgressDialog(): void {
  let progressWindow: BrowserWindow | null = null

  progressWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    alwaysOnTop: true,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const progressHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Downloading Update</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 160px;
        }
        .container {
          text-align: center;
        }
        .title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        .progress-container {
          background: #e0e0e0;
          border-radius: 10px;
          height: 20px;
          margin: 20px 0;
          overflow: hidden;
        }
        .progress-bar {
          background: linear-gradient(90deg, #4CAF50, #45a049);
          height: 100%;
          width: 0%;
          transition: width 0.3s ease;
          border-radius: 10px;
        }
        .progress-text {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }
        .status {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
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

  const downloadedHandler = (): void => {
    console.log('update-downloaded event fired!')

    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.destroy()
      progressWindow = null
    }

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
            console.log('User clicked Restart Now - attempting to quit and install')

            app.removeAllListeners('window-all-closed')
            setImmediate(() => {
              autoUpdater.quitAndInstall(false, true)
            })
          } else {
            console.log('User chose to restart later')
          }
        })
        .catch((err) => {
          console.error('Error showing restart dialog:', err)
        })
    }, 100)
  }

  const errorHandler = (err: Error): void => {
    console.error('Download error:', err)
    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.destroy()
      progressWindow = null
    }
    dialog.showErrorBox('Update Error', `Failed to download update: ${err.message}`)
  }

  autoUpdater.on('download-progress', progressHandler)
  autoUpdater.once('update-downloaded', downloadedHandler)
  autoUpdater.once('error', errorHandler)

  progressWindow.on('closed', () => {
    autoUpdater.removeListener('download-progress', progressHandler)
    autoUpdater.removeListener('update-downloaded', downloadedHandler)
    autoUpdater.removeListener('error', errorHandler)
    progressWindow = null
  })
}

export function checkForUpdatesOnStartup(): void {
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates()
    }, 3000)
  }
}
