export interface ProcessOptions {
  template: string
  language: string
  customDictionary?: string[]
  duration?: number
}

export interface ProcessResult {
  original: string
  refined: string
}

export interface HistoryRecord {
  id: number
  original_text: string
  refined_text: string
  template: string
  language: string
  audio_duration: number
  char_count: number
  created_at: string
}

export interface HistoryListResult {
  records: HistoryRecord[]
  total: number
}

export interface DictionaryWord {
  id: number
  word: string
  category: string
  created_at: string
}

export interface AppStats {
  total_characters: number
  total_recordings: number
  total_audio_secs: number
}

export interface TemplateConfig {
  name: string
  prompt: string
}

export interface HotkeyConfig {
  startStop: string
  cancel: string
}

export interface AppConfig {
  openaiApiKey: string
  hotkeys: HotkeyConfig
  template: string
  transcriptionLang: string
  outputLang: string
  autoSwitchTemplate: boolean
  theme: 'light' | 'dark' | 'system'
  launchAtLogin: boolean
  minimizeToTray: boolean
  pasteDelay: number
  restoreClipboard: boolean
  whisperModel: string
  gptModel: string
  gptTemperature: number
}
