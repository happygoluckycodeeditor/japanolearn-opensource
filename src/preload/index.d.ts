import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // Existing methods...
      selectImage: () => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
      getUserDataPath: () => Promise<string>
    }
  }
}
