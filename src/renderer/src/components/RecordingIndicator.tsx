import { useAppStore, type RecordingStatus } from '@renderer/stores/appStore'

const statusConfig: Record<RecordingStatus, { label: string; color: string; bg: string }> = {
  idle: { label: '待機中', color: 'text-gray-500', bg: 'bg-gray-100' },
  recording: { label: '錄音中', color: 'text-red-600', bg: 'bg-red-50' },
  processing: { label: '處理中', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  done: { label: '完成', color: 'text-green-600', bg: 'bg-green-50' },
  error: { label: '錯誤', color: 'text-red-600', bg: 'bg-red-50' }
}

export default function RecordingIndicator() {
  const { recordingStatus, recordingDuration, errorMessage } = useAppStore()
  const config = statusConfig[recordingStatus]

  const formatDuration = (secs: number): string => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`rounded-xl p-6 ${config.bg} transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              recordingStatus === 'recording' ? 'bg-red-500 animate-pulse-recording' : 'bg-white'
            }`}
          >
            {recordingStatus === 'recording' && (
              <span className="text-white text-2xl">🎤</span>
            )}
            {recordingStatus === 'processing' && (
              <span className="text-2xl animate-spin">⏳</span>
            )}
            {recordingStatus === 'idle' && <span className="text-2xl">🎙️</span>}
            {recordingStatus === 'done' && <span className="text-2xl">✅</span>}
            {recordingStatus === 'error' && <span className="text-2xl">❌</span>}
          </div>
        </div>
        <div>
          <p className={`text-lg font-semibold ${config.color}`}>{config.label}</p>
          {recordingStatus === 'recording' && (
            <p className="text-sm text-gray-500">{formatDuration(recordingDuration)}</p>
          )}
          {recordingStatus === 'idle' && (
            <p className="text-sm text-gray-400">按下 Ctrl+Shift+Space 開始錄音</p>
          )}
          {recordingStatus === 'error' && errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
