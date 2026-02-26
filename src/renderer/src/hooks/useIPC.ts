import { useEffect } from 'react'
import { useRecorder } from './useRecorder'
import { ipc } from '@renderer/lib/ipc'
import { useAppStore } from '@renderer/stores/appStore'

export function useIPC() {
  const { startRecording, stopRecording, cancelRecording } = useRecorder()
  const { setStats, updateSettings } = useAppStore()

  useEffect(() => {
    // 監聽來自 Main Process 的錄音指令
    ipc.onRecordingStart(() => {
      startRecording()
    })

    ipc.onRecordingStop(() => {
      stopRecording()
    })

    ipc.onRecordingCancel(() => {
      cancelRecording()
    })

    // 載入統計資料
    ipc.getStats().then((stats) => {
      setStats({
        totalCharacters: stats.total_characters,
        totalRecordings: stats.total_recordings
      })
    })

    // 載入設定
    ipc.getAllConfig().then((config) => {
      updateSettings({
        template: config.template,
        transcriptionLang: config.transcriptionLang,
        outputLang: config.outputLang,
        autoSwitchTemplate: config.autoSwitchTemplate,
        hotkey: config.hotkeys.startStop
      })
    })

    return () => {
      ipc.removeRecordingListeners()
    }
  }, [])
}
