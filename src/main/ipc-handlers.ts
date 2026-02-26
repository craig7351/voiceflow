import { ipcMain, BrowserWindow, shell, app } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import { AudioProcessorService } from './services/audio.service'
import { ConfigService } from './services/config.service'
import { DatabaseService } from './services/database.service'
import { PasteService } from './services/paste.service'
import { TemplateService } from './services/template.service'
import type { AppConfig, ProcessOptions } from '../shared/types'

export function registerIPCHandlers(_mainWindow: BrowserWindow): void {
  // 音訊處理
  ipcMain.handle(
    IPC_CHANNELS.AUDIO_PROCESS,
    async (_event, buffer: Buffer, options: ProcessOptions) => {
      const dictionary = DatabaseService.getDictionaryWords()
      return AudioProcessorService.processAudio(buffer, {
        ...options,
        customDictionary: dictionary
      })
    }
  )

  // 設定
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, (_event, key: keyof AppConfig) => {
    return ConfigService.get(key)
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_event, key: keyof AppConfig, value: unknown) => {
    ConfigService.set(key, value as AppConfig[typeof key])
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET_ALL, () => {
    return ConfigService.getAll()
  })

  // 歷史紀錄
  ipcMain.handle(IPC_CHANNELS.HISTORY_LIST, (_event, page: number, limit: number) => {
    return DatabaseService.listRecords(page, limit)
  })

  ipcMain.handle(IPC_CHANNELS.HISTORY_DELETE, (_event, id: number) => {
    DatabaseService.deleteRecord(id)
  })

  ipcMain.handle(IPC_CHANNELS.HISTORY_SEARCH, (_event, query: string) => {
    return DatabaseService.searchRecords(query)
  })

  ipcMain.handle(IPC_CHANNELS.HISTORY_EXPORT, () => {
    return DatabaseService.exportRecords()
  })

  // 字典
  ipcMain.handle(IPC_CHANNELS.DICT_LIST, () => {
    return DatabaseService.listDictionary()
  })

  ipcMain.handle(IPC_CHANNELS.DICT_ADD, (_event, word: string) => {
    DatabaseService.addWord(word)
  })

  ipcMain.handle(IPC_CHANNELS.DICT_REMOVE, (_event, word: string) => {
    DatabaseService.removeWord(word)
  })

  ipcMain.handle(IPC_CHANNELS.DICT_IMPORT, (_event, words: string[]) => {
    DatabaseService.importWords(words)
  })

  // 貼上
  ipcMain.handle(IPC_CHANNELS.PASTE_TEXT, async (_event, text: string) => {
    const restoreClipboard = ConfigService.get('restoreClipboard')
    const pasteDelay = ConfigService.get('pasteDelay')
    await PasteService.pasteText(text, restoreClipboard, pasteDelay)
  })

  // 統計
  ipcMain.handle(IPC_CHANNELS.STATS_GET, () => {
    return DatabaseService.getStats()
  })

  // 取得所有模板
  ipcMain.handle('templates:list', () => {
    return TemplateService.getAllTemplates()
  })

  // 取得預設模板
  ipcMain.handle('templates:defaults', () => {
    return TemplateService.getDefaultTemplates()
  })

  // 設定自訂模板 prompt
  ipcMain.handle(
    'templates:set',
    (_event, templateId: string, config: { name: string; prompt: string }) => {
      TemplateService.setCustomTemplate(templateId, config)
    }
  )

  // 重置模板為預設
  ipcMain.handle('templates:reset', (_event, templateId: string) => {
    TemplateService.resetTemplate(templateId)
  })

  // 刪除使用者自訂模板
  ipcMain.handle('templates:delete', (_event, templateId: string) => {
    TemplateService.deleteCustomTemplate(templateId)
  })

  // 開啟設定檔目錄
  ipcMain.handle('config:open-dir', () => {
    const configPath = app.getPath('userData')
    shell.openPath(configPath)
  })
}
