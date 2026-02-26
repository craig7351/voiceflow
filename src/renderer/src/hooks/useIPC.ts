import { useEffect, useRef } from 'react'
import { useRecorder } from './useRecorder'
import { ipc } from '@renderer/lib/ipc'
import { useAppStore } from '@renderer/stores/appStore'

export function useIPC() {
  const { startRecording, stopRecording, cancelRecording } = useRecorder()
  const { setStats, updateSettings } = useAppStore()

  // 用 ref 追蹤最新的 callback，避免 stale closure
  const startRef = useRef(startRecording)
  const stopRef = useRef(stopRecording)
  const cancelRef = useRef(cancelRecording)

  useEffect(() => { startRef.current = startRecording }, [startRecording])
  useEffect(() => { stopRef.current = stopRecording }, [stopRecording])
  useEffect(() => { cancelRef.current = cancelRecording }, [cancelRecording])

  useEffect(() => {
    // 監聽來自 Main Process 的錄音指令
    ipc.onRecordingStart(() => {
      startRef.current()
    })

    ipc.onRecordingStop(() => {
      stopRef.current()
    })

    ipc.onRecordingCancel(() => {
      cancelRef.current()
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
