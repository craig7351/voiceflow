import { useAppStore } from '@renderer/stores/appStore'
import { ipc } from '@renderer/lib/ipc'

const templates = [
  { id: 'general', name: '通用', icon: '📝' },
  { id: 'notion', name: 'Notion', icon: '📓' },
  { id: 'slack', name: 'Slack', icon: '💬' },
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'plain', name: '純文字', icon: '📄' }
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
          <button
            key={t.id}
            onClick={() => handleChange(t.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all ${
              settings.template === t.id
                ? 'bg-green-100 text-primary border-2 border-primary'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}
