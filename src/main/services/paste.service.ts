import { clipboard } from 'electron'

class PasteServiceClass {
  async pasteText(text: string, restoreClipboard = true, pasteDelay = 100): Promise<void> {
    // 備份當前剪貼簿內容
    const previousClipboard = clipboard.readText()

    // 將潤稿後文字寫入剪貼簿
    clipboard.writeText(text)

    // 等待剪貼簿更新
    await this.delay(pasteDelay)

    // 根據平台模擬貼上快捷鍵
    if (process.platform === 'darwin') {
      // macOS: Cmd+V
      const { execSync } = await import('child_process')
      execSync(
        `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
      )
    } else {
      // Windows: 使用 PowerShell 模擬 Ctrl+V
      const { execSync } = await import('child_process')
      execSync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`,
        { windowsHide: true }
      )
    }

    // 等待貼上完成後，還原剪貼簿
    if (restoreClipboard) {
      await this.delay(300)
      clipboard.writeText(previousClipboard)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const PasteService = new PasteServiceClass()
