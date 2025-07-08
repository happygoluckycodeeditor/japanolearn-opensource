import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  dictionary: {
    search: (query: string): Promise<unknown> => ipcRenderer.invoke('dictionary:search', query)
  },
  selectImage: (): Promise<unknown> => ipcRenderer.invoke('select-image'),
  getUserDataPath: (): Promise<unknown> => ipcRenderer.invoke('get-user-data-path')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        // Make sure 'quit-app' is included in the list of exposed channels
        send: (channel: string, ...args: unknown[]) => {
          if (
            ['ping', 'quit-app', 'save-username' /* other allowed channels */].includes(channel)
          ) {
            ipcRenderer.send(channel, ...args)
          }
        },
        // other methods you might need
        invoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
          // List of allowed channels for invoke
          const validChannels = [
            'save-username',
            'get-users',
            'reset-database',
            'update-username',
            'dictionary:search',
            'select-image',
            'get-user-data-path',
            // Lesson management channels
            'get-lessons',
            'get-lesson-questions',
            'add-lesson',
            'update-lesson',
            'delete-lesson',
            // Exercise management channels
            'get-exercises',
            'get-exercise-questions',
            'add-exercise',
            'update-exercise',
            'delete-exercise',
            // Question management channels
            'add-exercise-question',
            'update-exercise-question',
            'delete-exercise-question',
            // Lesson question management channels - ADD THESE
            'add-lesson-question',
            'update-lesson-question',
            'delete-lesson-question',
            'get-secure-image-url',
            // User profile channels - ADD THESE
            'get-user-profile',
            'get-user-activity',
            'record-lesson-completion',
            'record-exercise-attempt',
            'get-user-lesson-progress'
          ]

          if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args)
          }

          return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`))
        }
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    ipcRenderer: {
      invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
        ipcRenderer.invoke(channel, ...args)
    }
  }
  // @ts-ignore (define in dts)
  window.api = api
}
