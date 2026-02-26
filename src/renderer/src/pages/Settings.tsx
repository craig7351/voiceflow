import { useState, useEffect } from 'react'
import { ipc } from '@renderer/lib/ipc'
import type { AppConfig, AiProvider } from '@shared/types'

export default function Settings() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [openaiKey, setOpenaiKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    ipc.getAllConfig().then((c) => {
      setConfig(c)
      setOpenaiKey(c.openaiApiKey || '')
      setGeminiKey(c.geminiApiKey || '')
    })
  }, [])

  const handleSave = async (key: keyof AppConfig, value: unknown) => {
    await ipc.setConfig(key as string, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // reload
    const c = await ipc.getAllConfig()
    setConfig(c)
  }

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">載入中...</p>
      </div>
    )
  }

  const provider: AiProvider = config.aiProvider || 'openai'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">設定</h2>

      {saved && (
        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
          ✅ 設定已儲存
        </div>
      )}

      <div className="space-y-4">
        {/* AI Provider 切換 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🧠 AI Provider</h3>
          <p className="text-xs text-gray-400 mb-3">
            選擇語音轉文字與潤稿使用的 AI 服務。
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSave('aiProvider', 'openai')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${provider === 'openai'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => handleSave('aiProvider', 'gemini')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${provider === 'gemini'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              Gemini
            </button>
          </div>
        </div>

        {/* API Key — 根據 Provider 顯示 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            🔑 {provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            API Key 加密存儲於本機，不會上傳至任何伺服器。
          </p>
          {provider === 'openai' ? (
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => handleSave('openaiApiKey', openaiKey)}
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
              >
                儲存
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="AIza..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => handleSave('geminiApiKey', geminiKey)}
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
              >
                儲存
              </button>
            </div>
          )}
        </div>

        {/* 熱鍵設定 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⌨️ 快捷鍵</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">開始/停止錄音</label>
              <input
                type="text"
                value={config.hotkeys.startStop}
                readOnly
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">取消錄音</label>
              <input
                type="text"
                value={config.hotkeys.cancel}
                readOnly
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* AI 模型設定 — 根據 Provider 顯示不同選項 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🤖 AI 模型</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {provider === 'openai' ? 'GPT 模型' : 'Gemini 模型'}
              </label>
              {provider === 'openai' ? (
                <select
                  value={config.gptModel}
                  onChange={(e) => handleSave('gptModel', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              ) : (
                <select
                  value={config.geminiModel}
                  onChange={(e) => handleSave('geminiModel', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                溫度 ({config.gptTemperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.gptTemperature}
                onChange={(e) => handleSave('gptTemperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 行為設定 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🔧 行為設定</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-600">關閉時最小化到系統匣</span>
              <input
                type="checkbox"
                checked={config.minimizeToTray}
                onChange={(e) => handleSave('minimizeToTray', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-600">貼上後還原剪貼簿</span>
              <input
                type="checkbox"
                checked={config.restoreClipboard}
                onChange={(e) => handleSave('restoreClipboard', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-600">開機自動啟動</span>
              <input
                type="checkbox"
                checked={config.launchAtLogin}
                onChange={(e) => handleSave('launchAtLogin', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 設定檔位置 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">📂 設定檔位置</h3>
        <button
          onClick={() => ipc.openConfigDir()}
          className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          開啟設定目錄
        </button>
      </div>
    </div>
  )
}
