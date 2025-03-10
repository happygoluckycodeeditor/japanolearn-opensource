import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

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
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
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
