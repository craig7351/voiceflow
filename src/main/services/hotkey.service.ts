import { globalShortcut, BrowserWindow } from 'electron'
import { ConfigService } from './config.service'
import type { HotkeyConfig } from '../../shared/types'

class HotkeyServiceClass {
  private isRecording = false

  register(window: BrowserWindow): void {
    const config = ConfigService.get('hotkeys') as HotkeyConfig

    globalShortcut.register(config.startStop, () => {
      if (this.isRecording) {
        this.stopRecording(window)
      } else {
        this.startRecording(window)
      }
    })

    globalShortcut.register(config.cancel, () => {
      if (this.isRecording) {
        this.cancelRecording(window)
      }
    })
  }

  unregister(): void {
    globalShortcut.unregisterAll()
  }

  reregister(window: BrowserWindow): void {
    this.unregister()
    this.register(window)
  }

  getIsRecording(): boolean {
    return this.isRecording
  }

  private startRecording(window: BrowserWindow): void {
    this.isRecording = true
    window.webContents.send('recording:start')
  }

  private stopRecording(window: BrowserWindow): void {
    this.isRecording = false
    window.webContents.send('recording:stop')
  }

  private cancelRecording(window: BrowserWindow): void {
    this.isRecording = false
    window.webContents.send('recording:cancel')
  }
}

export const HotkeyService = new HotkeyServiceClass()
