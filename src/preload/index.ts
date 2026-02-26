import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ProcessOptions } from '../shared/types'

const voiceflowAPI = {
  // 錄音事件監聽
  onRecordingStart: (cb: () => void): void => {
    ipcRenderer.on('recording:start', cb)
  },
  onRecordingStop: (cb: () => void): void => {
    ipcRenderer.on('recording:stop', cb)
  },
  onRecordingCancel: (cb: () => void): void => {
    ipcRenderer.on('recording:cancel', cb)
  },
  removeRecordingListeners: (): void => {
    ipcRenderer.removeAllListeners('recording:start')
    ipcRenderer.removeAllListeners('recording:stop')
    ipcRenderer.removeAllListeners('recording:cancel')
  },

  // 音訊處理
  processAudio: (buffer: ArrayBuffer, options: ProcessOptions) =>
    ipcRenderer.invoke('audio:process', Buffer.from(buffer), options),

  // 貼上
  pasteText: (text: string) => ipcRenderer.invoke('paste:text', text),

  // 設定
  getConfig: (key: string) => ipcRenderer.invoke('config:get', key),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  getAllConfig: () => ipcRenderer.invoke('config:get-all'),

  // 歷史紀錄
  getHistory: (page: number, limit: number) => ipcRenderer.invoke('history:list', page, limit),
  searchHistory: (query: string) => ipcRenderer.invoke('history:search', query),
  deleteHistory: (id: number) => ipcRenderer.invoke('history:delete', id),
  exportHistory: () => ipcRenderer.invoke('history:export'),

  // 字典
  getDictionary: () => ipcRenderer.invoke('dict:list'),
  addWord: (word: string) => ipcRenderer.invoke('dict:add', word),
  removeWord: (word: string) => ipcRenderer.invoke('dict:remove', word),
  importWords: (words: string[]) => ipcRenderer.invoke('dict:import', words),

  // 統計
  getStats: () => ipcRenderer.invoke('stats:get'),

  // 模板
  getTemplates: () => ipcRenderer.invoke('templates:list'),
  getDefaultTemplates: () => ipcRenderer.invoke('templates:defaults'),
  setTemplate: (templateId: string, config: { name: string; prompt: string }) =>
    ipcRenderer.invoke('templates:set', templateId, config),
  resetTemplate: (templateId: string) => ipcRenderer.invoke('templates:reset', templateId),
  deleteTemplate: (templateId: string) => ipcRenderer.invoke('templates:delete', templateId),

  // 開啟設定目錄
  openConfigDir: () => ipcRenderer.invoke('config:open-dir')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', voiceflowAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = voiceflowAPI
}
