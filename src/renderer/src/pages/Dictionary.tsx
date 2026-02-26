import { useState, useEffect, useCallback } from 'react'
import { ipc } from '@renderer/lib/ipc'
import type { DictionaryWord } from '@shared/types'

export default function Dictionary() {
  const [words, setWords] = useState<DictionaryWord[]>([])
  const [newWord, setNewWord] = useState('')
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  const loadWords = useCallback(async () => {
    const result = await ipc.getDictionary()
    setWords(result)
  }, [])

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const handleAdd = async () => {
    const word = newWord.trim()
    if (!word) return
    await ipc.addWord(word)
    setNewWord('')
    loadWords()
  }

  const handleRemove = async (word: string) => {
    await ipc.removeWord(word)
    loadWords()
  }

  const handleImport = async () => {
    const wordList = importText
      .split(/[,，\n]/)
      .map((w) => w.trim())
      .filter(Boolean)
    if (wordList.length === 0) return
    await ipc.importWords(wordList)
    setImportText('')
    setShowImport(false)
    loadWords()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">自訂字典</h2>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
        >
          {showImport ? '取消匯入' : '批量匯入'}
        </button>
      </div>

      {/* 批量匯入 */}
      {showImport && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
          <p className="text-sm text-gray-500 mb-2">
            請輸入詞彙，以逗號或換行分隔：
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="例：TypeScript, React, Electron"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleImport}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
          >
            匯入
          </button>
        </div>
      )}

      {/* 新增詞彙 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="輸入新詞彙..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
          >
            新增
          </button>
        </div>
      </div>

      {/* 詞彙列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 text-sm text-gray-500 font-medium">
          共 {words.length} 個詞彙
        </div>
        <div className="divide-y divide-gray-50">
          {words.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
            >
              <div>
                <span className="text-sm font-medium text-gray-900">{w.word}</span>
                <span className="ml-2 text-xs text-gray-400">{w.category}</span>
              </div>
              <button
                onClick={() => handleRemove(w.word)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                移除
              </button>
            </div>
          ))}
          {words.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              尚未新增任何詞彙
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
