import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'
import { ConfigService } from './services/config.service'
import { DatabaseService } from './services/database.service'
import { HotkeyService } from './services/hotkey.service'
import { TrayService } from './tray'
import { registerIPCHandlers } from './ipc-handlers'
import { UpdaterService } from './services/updater.service'

let mainWindow: BrowserWindow | null = null

async function bootstrap(): Promise<void> {
  // 1. 單實例鎖定
  const gotLock = app.requestSingleInstanceLock()
  if (!gotLock) {
    app.quit()
    return
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // 2. 初始化設定存取
  ConfigService.init()

  // 3. 初始化資料庫
  DatabaseService.init()

  // 4. 建立主視窗
  mainWindow = createMainWindow()

  // 5. 註冊全域熱鍵
  HotkeyService.register(mainWindow)

  // 6. 建立系統匣
  TrayService.create(mainWindow)

  // 7. 註冊所有 IPC Handlers
  registerIPCHandlers(mainWindow)

  // 8. 初始化自動更新 (僅在 production)
  if (app.isPackaged) {
    UpdaterService.init(mainWindow)
  }

  // 最小化到系統匣
  const minimizeToTray = ConfigService.get('minimizeToTray')
  if (minimizeToTray) {
    mainWindow.on('close', (event) => {
      if (!(app as unknown as { isQuitting: boolean }).isQuitting) {
        event.preventDefault()
        mainWindow?.hide()
      }
    })
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.voiceflow.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  bootstrap()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      bootstrap()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  HotkeyService.unregister()
  TrayService.destroy()
})

// 標記 app 正在退出
;(app as unknown as { isQuitting: boolean }).isQuitting = false

app.on('before-quit', () => {
  ;(app as unknown as { isQuitting: boolean }).isQuitting = true
})
