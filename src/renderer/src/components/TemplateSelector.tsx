import { useState, useEffect } from 'react'
import { useAppStore } from '@renderer/stores/appStore'
import { ipc } from '@renderer/lib/ipc'
import type { TemplateConfig } from '@shared/types'

const defaultIcons: Record<string, string> = {
  general: '📝',
  notion: '📓',
  slack: '💬',
  email: '📧',
  plain: '💕'
}

export default function TemplateSelector() {
  const { settings, updateSettings } = useAppStore()
  const [templates, setTemplates] = useState<Record<string, TemplateConfig>>({})

  useEffect(() => {
    ipc.getTemplates().then(setTemplates)
  }, [])

  const handleChange = async (templateId: string) => {
    updateSettings({ template: templateId })
    await ipc.setConfig('template', templateId)
  }

  const ids = Object.keys(templates)

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">情境模板</label>
      <div className="grid grid-cols-5 gap-2">
        {ids.map((id) => (
          <div key={id} className="relative group">
            <button
              onClick={() => handleChange(id)}
              className={`w-full flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-all ${settings.template === id
                ? 'bg-green-100 text-primary border-2 border-primary'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
            >
              <span className="text-lg">{defaultIcons[id] || '📄'}</span>
              {templates[id].name}
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-white text-[10px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none max-w-48 text-center !whitespace-normal">
              {templates[id].prompt.slice(0, 60)}…
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
