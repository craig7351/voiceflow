import { useState, useEffect, useCallback } from 'react'
import { ipc } from '@renderer/lib/ipc'
import type { TemplateConfig } from '@shared/types'

export default function TemplateEditor() {
  const [templates, setTemplates] = useState<Record<string, TemplateConfig>>({})
  const [defaults, setDefaults] = useState<Record<string, TemplateConfig>>({})
  const [selectedId, setSelectedId] = useState<string>('general')
  const [editName, setEditName] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [saved, setSaved] = useState(false)
  const [newId, setNewId] = useState('')
  const [showNew, setShowNew] = useState(false)

  const load = useCallback(async () => {
    const [tpls, defs] = await Promise.all([ipc.getTemplates(), ipc.getDefaultTemplates()])
    setTemplates(tpls)
    setDefaults(defs)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (templates[selectedId]) {
      setEditName(templates[selectedId].name)
      setEditPrompt(templates[selectedId].prompt)
    }
  }, [selectedId, templates])

  const handleSave = async () => {
    await ipc.setTemplate(selectedId, { name: editName, prompt: editPrompt })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    await load()
  }

  const handleReset = async () => {
    if (!defaults[selectedId]) return
    await ipc.resetTemplate(selectedId)
    await load()
  }

  const handleAddNew = async () => {
    const id = newId.trim().toLowerCase().replace(/\s+/g, '-')
    if (!id || templates[id]) return
    await ipc.setTemplate(id, { name: newId.trim(), prompt: '' })
    setNewId('')
    setShowNew(false)
    await load()
    setSelectedId(id)
  }

  const handleDelete = async (id: string) => {
    if (defaults[id]) return // 不能刪預設
    await ipc.deleteTemplate(id)
    if (selectedId === id) setSelectedId('general')
    await load()
  }

  const isDefault = !!defaults[selectedId]
  const isModified =
    isDefault &&
    (editName !== defaults[selectedId]?.name || editPrompt !== defaults[selectedId]?.prompt)

  const templateIds = Object.keys(templates)

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">模板編輯</h2>
      <p className="text-sm text-gray-500 mb-4">
        即時調整每個情境模板的 AI Prompt，修改後立即生效，無需重新啟動。
      </p>

      {saved && (
        <div className="mb-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
          ✅ 模板已儲存
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 左側模板列表 */}
        <div className="w-48 flex-shrink-0 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
            {templateIds.map((id) => (
              <div
                key={id}
                onClick={() => setSelectedId(id)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${
                  selectedId === id
                    ? 'bg-green-50 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{templates[id].name}</span>
                {!defaults[id] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(id)
                    }}
                    className="text-red-400 hover:text-red-600 text-xs ml-2 flex-shrink-0"
                    title="刪除"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 新增模板 */}
          {showNew ? (
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                placeholder="模板名稱"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleAddNew}
                className="px-2 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary-dark"
              >
                +
              </button>
              <button
                onClick={() => {
                  setShowNew(false)
                  setNewId('')
                }}
                className="px-2 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-300"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              + 新增模板
            </button>
          )}
        </div>

        {/* 右側編輯區 */}
        <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">模板名稱</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-xs text-gray-500 mb-1 block">System Prompt</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="輸入 AI 潤稿的 System Prompt..."
              className="flex-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {isDefault && isModified && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  已修改（與預設不同）
                </span>
              )}
              {!isDefault && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  自訂模板
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {isDefault && isModified && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  還原預設
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
