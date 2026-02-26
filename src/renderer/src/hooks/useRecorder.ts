import { useRef, useCallback } from 'react'
import { useAppStore } from '@renderer/stores/appStore'
import { ipc } from '@renderer/lib/ipc'

export function useRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startTime = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { setRecordingStatus, setRecordingDuration, setLastOutput, updateStats, setErrorMessage, settings } =
    useAppStore()

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 開始取得麥克風權限...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunks.current = []
      startTime.current = Date.now()

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const buffer = await blob.arrayBuffer()
        const duration = (Date.now() - startTime.current) / 1000
        console.log(`🛑 錄音結束，時長 ${duration.toFixed(1)}s，音訊大小 ${(buffer.byteLength / 1024).toFixed(1)}KB`)

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        setRecordingStatus('processing')
        console.log(`⏳ 開始處理音訊... (模板: ${settings.template}, 語言: ${settings.transcriptionLang})`)

        try {
          const result = await ipc.processAudio(buffer, {
            template: settings.template,
            language: settings.transcriptionLang,
            duration
          })
          console.log(`✅ 轉錄完成，原文: "${result.original.slice(0, 50)}..."`)
          console.log(`✅ 潤稿完成，結果: "${result.refined.slice(0, 50)}..."`)

          setLastOutput({
            original: result.original,
            refined: result.refined,
            template: settings.template,
            timestamp: Date.now()
          })
          updateStats(result.refined.length)
          setRecordingStatus('done')

          // 自動貼上
          console.log('📋 自動貼上文字...')
          await ipc.pasteText(result.refined)
        } catch (err) {
          console.error('❌ 音訊處理失敗:', err instanceof Error ? err.message : err)
          setErrorMessage(err instanceof Error ? err.message : '處理失敗')
          setRecordingStatus('error')
        }

        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.current.start()
      console.log('🎙️ 錄音中...')
      setRecordingStatus('recording')
      setErrorMessage(null)

      // 計時器
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime.current) / 1000))
      }, 1000)
    } catch (err) {
      console.error('❌ 無法取得麥克風權限:', err)
      setErrorMessage('無法取得麥克風權限')
      setRecordingStatus('error')
    }
  }, [settings.template, settings.transcriptionLang])

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop()
  }, [])

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop())
      mediaRecorder.current = null
      chunks.current = []
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingStatus('idle')
    setRecordingDuration(0)
  }, [])

  return { startRecording, stopRecording, cancelRecording }
}
