import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron'
import { join } from 'path'

class TrayServiceClass {
  private tray: Tray | null = null

  create(window: BrowserWindow): void {
    const iconPath = join(__dirname, '../../resources/icon.png')
    let trayIcon: Electron.NativeImage
    try {
      trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    } catch {
      trayIcon = nativeImage.createEmpty()
    }

    this.tray = new Tray(trayIcon)
    this.tray.setToolTip('VoiceFlow - AI 語音輸入助手')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '開啟 VoiceFlow',
        click: (): void => {
          window.show()
          window.focus()
        }
      },
      { type: 'separator' },
      {
        label: '結束',
        click: (): void => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)

    this.tray.on('double-click', () => {
      window.show()
      window.focus()
    })
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}

export const TrayService = new TrayServiceClass()
