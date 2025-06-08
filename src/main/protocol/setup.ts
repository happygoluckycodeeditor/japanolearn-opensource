import { protocol } from 'electron'
import url from 'url'

export function setupProtocolHandlers(): void {
  // Register protocol handler for images
  protocol.registerFileProtocol('app-image', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('app-image://'.length))
    callback({ path: filePath })
  })
}