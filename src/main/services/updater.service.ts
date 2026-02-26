import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

class UpdaterServiceClass {
  init(window?: BrowserWindow): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
      if (window) {
        window.webContents.send('update:available', info)
      }
    })

    autoUpdater.on('update-downloaded', () => {
      if (window) {
        window.webContents.send('update:downloaded')
      }
    })

    autoUpdater.on('error', (err) => {
      console.error('Auto-update error:', err)
    })

    autoUpdater.checkForUpdates().catch(() => {})
  }

  async checkForUpdates(): Promise<void> {
    await autoUpdater.checkForUpdates()
  }

  downloadUpdate(): void {
    autoUpdater.downloadUpdate()
  }

  installUpdate(): void {
    autoUpdater.quitAndInstall()
  }
}

export const UpdaterService = new UpdaterServiceClass()
