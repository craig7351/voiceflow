import Store from 'electron-store'
import type { AppConfig } from '../../shared/types'

const defaults: AppConfig = {
  aiProvider: 'openai',
  openaiApiKey: '',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  hotkeys: {
    startStop: 'CommandOrControl+Shift+Space',
    cancel: 'Escape'
  },
  template: 'general',
  transcriptionLang: 'auto',
  outputLang: 'zh-TW',
  autoSwitchTemplate: true,
  theme: 'system',
  launchAtLogin: false,
  minimizeToTray: true,
  pasteDelay: 100,
  restoreClipboard: true,
  whisperModel: 'whisper-1',
  gptModel: 'gpt-4o-mini',
  gptTemperature: 0.3
}

class ConfigServiceClass {
  private store!: Store<AppConfig>

  init(): void {
    const StoreClass = (Store as unknown as { default: typeof Store }).default || Store
    this.store = new StoreClass({
      defaults,
      encryptionKey: 'voiceflow-secure-key',
      name: 'voiceflow-config'
    })
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.store.get(key)
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.store.set(key, value)
  }

  getAll(): AppConfig {
    return this.store.store
  }
}

export const ConfigService = new ConfigServiceClass()
