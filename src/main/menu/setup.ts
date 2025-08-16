import { app, Menu, dialog, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { autoUpdater } from 'electron-updater'

export function createMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideothers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ] as MenuItemConstructorOptions[]
          }
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ] as MenuItemConstructorOptions[]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [
                  { role: 'startSpeaking' as const },
                  { role: 'stopSpeaking' as const }
                ] as MenuItemConstructorOptions[]
              }
            ]
          : [
              { role: 'delete' as const },
              { type: 'separator' as const },
              { role: 'selectAll' as const }
            ])
      ] as MenuItemConstructorOptions[]
    },

    // Help menu
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
      ] as MenuItemConstructorOptions[]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
