import { protocol, net } from 'electron'
import { pathToFileURL } from 'url'

export function setupProtocolHandlers(): void {
  // Register protocol handler for images
  protocol.handle('app-image', (request) => {
    const filePath = decodeURIComponent(request.url.slice('app-image://'.length))
    return net.fetch(pathToFileURL(filePath).toString())
  })

  // Register protocol handler for audio files
  protocol.handle('app-audio', (request) => {
    const filePath = decodeURIComponent(request.url.slice('app-audio://'.length))
    return net.fetch(pathToFileURL(filePath).toString())
  })
}
