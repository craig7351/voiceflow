import { ElectronAPI } from '@electron-toolkit/preload'
import type { ProcessOptions, ProcessResult, HistoryRecord, HistoryListResult, DictionaryWord, AppStats, AppConfig, TemplateConfig } from '../shared/types'

interface VoiceFlowAPI {
  onRecordingStart: (cb: () => void) => void
  onRecordingStop: (cb: () => void) => void
  onRecordingCancel: (cb: () => void) => void
  removeRecordingListeners: () => void
  processAudio: (buffer: ArrayBuffer, options: ProcessOptions) => Promise<ProcessResult>
  pasteText: (text: string) => Promise<void>
  getConfig: (key: string) => Promise<unknown>
  setConfig: (key: string, value: unknown) => Promise<void>
  getAllConfig: () => Promise<AppConfig>
  getHistory: (page: number, limit: number) => Promise<HistoryListResult>
  searchHistory: (query: string) => Promise<HistoryRecord[]>
  deleteHistory: (id: number) => Promise<void>
  exportHistory: () => Promise<HistoryRecord[]>
  getDictionary: () => Promise<DictionaryWord[]>
  addWord: (word: string) => Promise<void>
  removeWord: (word: string) => Promise<void>
  importWords: (words: string[]) => Promise<void>
  getStats: () => Promise<AppStats>
  getTemplates: () => Promise<Record<string, TemplateConfig>>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: VoiceFlowAPI
  }
}
