import { useState, useEffect, useCallback } from 'react'
import { ipc } from '@renderer/lib/ipc'
import type { HistoryRecord } from '@shared/types'

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const limit = 20

  const loadRecords = useCallback(async () => {
    if (search) {
      const results = await ipc.searchHistory(search)
      setRecords(results)
      setTotal(results.length)
    } else {
      const result = await ipc.getHistory(page, limit)
      setRecords(result.records)
      setTotal(result.total)
    }
  }, [page, search])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleDelete = async (id: number) => {
    await ipc.deleteHistory(id)
    loadRecords()
  }

  const handleExport = async () => {
    const allRecords = await ipc.exportHistory()
    const csv = [
      '時間,模板,原文,潤稿,字數',
      ...allRecords.map(
        (r) =>
          `"${r.created_at}","${r.template}","${r.original_text.replace(/"/g, '""')}","${r.refined_text.replace(/"/g, '""')}",${r.char_count}`
      )
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voiceflow-history-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">歷史紀錄</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
        >
          匯出 CSV
        </button>
      </div>

      {/* 搜尋欄 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜尋紀錄..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left px-4 py-3 font-medium">時間</th>
              <th className="text-left px-4 py-3 font-medium">模板</th>
              <th className="text-left px-4 py-3 font-medium">字數</th>
              <th className="text-left px-4 py-3 font-medium">預覽</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <td className="px-4 py-3 text-gray-600">{r.created_at}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-50 text-primary text-xs rounded-full">
                    {r.template}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.char_count}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                  {r.refined_text.slice(0, 50)}...
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(r.id)
                    }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  暫無紀錄
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 展開詳情 */}
        {expandedId && (
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
            {records
              .filter((r) => r.id === expandedId)
              .map((r) => (
                <div key={r.id} className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">原始轉錄</p>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                      {r.original_text}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">AI 潤稿</p>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                      {r.refined_text}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 分頁 */}
      {!search && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg text-sm border border-gray-200 disabled:opacity-30"
          >
            上一頁
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg text-sm border border-gray-200 disabled:opacity-30"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  )
}
