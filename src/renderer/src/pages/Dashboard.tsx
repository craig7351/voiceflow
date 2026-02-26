import { useAppStore } from '@renderer/stores/appStore'
import RecordingIndicator from '@renderer/components/RecordingIndicator'
import StatusCard from '@renderer/components/StatusCard'
import OutputPreview from '@renderer/components/OutputPreview'
import TemplateSelector from '@renderer/components/TemplateSelector'

export default function Dashboard() {
  const { stats } = useAppStore()

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">儀表板</h2>

      {/* 狀態區 + 統計卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1">
          <RecordingIndicator />
        </div>
        <StatusCard title="累積字數" value={stats.totalCharacters} icon="📊" />
        <StatusCard title="錄音次數" value={stats.totalRecordings} icon="🎤" />
      </div>

      {/* 輸入設定 + 輸出預覽 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">輸入設定</h3>
          <div className="space-y-4">
            <TemplateSelector />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">轉寫語言</label>
              <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="auto">自動偵測</option>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <OutputPreview />
      </div>
    </div>
  )
}
