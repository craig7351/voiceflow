import { useAppStore } from '@renderer/stores/appStore'
import { ipc } from '@renderer/lib/ipc'

const templates = [
  { id: 'general', name: '通用', icon: '📝', tip: '修正錯字、加標點，保持原意' },
  { id: 'notion', name: 'Notion', icon: '📓', tip: 'Markdown 格式，自動分段加標題' },
  { id: 'slack', name: 'Slack', icon: '💬', tip: '輕鬆專業語氣，搭配 emoji' },
  { id: 'email', name: 'Email', icon: '📧', tip: '正式郵件格式，含問候與結尾' },
  { id: 'plain', name: '純文字', icon: '📄', tip: '僅修正錯字標點，不改語句' }
]

export default function TemplateSelector() {
  const { settings, updateSettings } = useAppStore()

  const handleChange = async (templateId: string) => {
    updateSettings({ template: templateId })
    await ipc.setConfig('template', templateId)
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">情境模板</label>
      <div className="grid grid-cols-5 gap-2">
        {templates.map((t) => (
          <div key={t.id} className="relative group">
            <button
              onClick={() => handleChange(t.id)}
              className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all ${settings.template === t.id
                ? 'bg-green-100 text-primary border-2 border-primary'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.name}
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-white text-[10px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              {t.tip}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
