import { create } from 'zustand'

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'

interface LastOutput {
  original: string
  refined: string
  template: string
  timestamp: number
}

interface AppStats {
  totalCharacters: number
  totalRecordings: number
}

interface AppSettings {
  template: string
  transcriptionLang: string
  outputLang: string
  autoSwitchTemplate: boolean
  hotkey: string
}

interface AppState {
  recordingStatus: RecordingStatus
  recordingDuration: number
  lastOutput: LastOutput | null
  stats: AppStats
  settings: AppSettings
  errorMessage: string | null

  setRecordingStatus: (status: RecordingStatus) => void
  setRecordingDuration: (duration: number) => void
  setLastOutput: (output: LastOutput | null) => void
  updateStats: (chars: number) => void
  setStats: (stats: AppStats) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  setErrorMessage: (msg: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  recordingStatus: 'idle',
  recordingDuration: 0,
  lastOutput: null,
  stats: { totalCharacters: 0, totalRecordings: 0 },
  settings: {
    template: 'general',
    transcriptionLang: 'auto',
    outputLang: 'zh-TW',
    autoSwitchTemplate: true,
    hotkey: 'CommandOrControl+Shift+Space'
  },
  errorMessage: null,

  setRecordingStatus: (status): void => set({ recordingStatus: status }),
  setRecordingDuration: (duration): void => set({ recordingDuration: duration }),
  setLastOutput: (output): void => set({ lastOutput: output }),
  updateStats: (chars): void =>
    set((state) => ({
      stats: {
        totalCharacters: state.stats.totalCharacters + chars,
        totalRecordings: state.stats.totalRecordings + 1
      }
    })),
  setStats: (stats): void => set({ stats }),
  updateSettings: (settings): void =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
  setErrorMessage: (msg): void => set({ errorMessage: msg })
}))
