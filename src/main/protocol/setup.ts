import { protocol } from 'electron'
import { join } from 'path'
import url from 'url'

export function setupProtocolHandlers(): void {
  // Register app:// protocol for web-like origin (fixes YouTube embeds)
  protocol.registerFileProtocol('app', (request, callback) => {
    const urlPath = request.url.replace('app://', '')
    const filePath = join(__dirname, '../renderer', urlPath)
    callback({ path: filePath })
  })

  // Register protocol handler for images
  protocol.registerFileProtocol('app-image', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('app-image://'.length))
    callback({ path: filePath })
  })

  // Register protocol handler for audio files
  protocol.registerFileProtocol('app-audio', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('app-audio://'.length))
    callback({ path: filePath })
  })
}
