import { useAppStore } from '@renderer/stores/appStore'

export default function OutputPreview() {
  const { lastOutput } = useAppStore()

  if (!lastOutput) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">尚無輸出結果，請開始錄音</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">最近輸出</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-2">原始轉錄</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {lastOutput.original}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">AI 潤稿</p>
          <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {lastOutput.refined}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span>模板：{lastOutput.template}</span>
        <span>時間：{new Date(lastOutput.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
