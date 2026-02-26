import { useState, useEffect, useRef } from 'react'
import { getLogs, clearLogs, subscribe, type LogEntry } from '@renderer/lib/debugLogger'

const levelColors: Record<LogEntry['level'], string> = {
    log: 'text-gray-300',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400'
}

const levelBadge: Record<LogEntry['level'], string> = {
    log: 'bg-gray-700 text-gray-300',
    info: 'bg-blue-900 text-blue-300',
    warn: 'bg-yellow-900 text-yellow-300',
    error: 'bg-red-900 text-red-300'
}

export default function DebugPanel({ onClose }: { onClose: () => void }) {
    const [logs, setLogs] = useState<LogEntry[]>(getLogs())
    const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            setLogs([...getLogs()])
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.level === filter)

    const formatTime = (d: Date): string => {
        const date = new Date(d)
        return date.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            + '.' + String(date.getMilliseconds()).padStart(3, '0')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-[90vw] max-w-4xl h-[80vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
                {/* 標題列 */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🐛</span>
                        <h3 className="text-sm font-bold text-white">Debug Console</h3>
                        <span className="text-xs text-gray-400">{filteredLogs.length} 筆日誌</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 篩選按鈕 */}
                        {(['all', 'log', 'info', 'warn', 'error'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilter(level)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${filter === level
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {level === 'all' ? 'All' : level.toUpperCase()}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-gray-600 mx-1" />
                        <button
                            onClick={clearLogs}
                            className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
                        >
                            🗑️ 清除
                        </button>
                        <button
                            onClick={onClose}
                            className="px-2 py-1 text-xs rounded-md bg-red-800 text-red-200 hover:bg-red-700 transition-colors"
                        >
                            ✕ 關閉
                        </button>
                    </div>
                </div>

                {/* 日誌列表 */}
                <div className="flex-1 overflow-y-auto font-mono text-xs p-2 space-y-0.5">
                    {filteredLogs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            尚無日誌紀錄
                        </div>
                    ) : (
                        filteredLogs.map((entry) => (
                            <div
                                key={entry.id}
                                className={`flex items-start gap-2 px-2 py-1 rounded hover:bg-gray-800/50 ${entry.level === 'error' ? 'bg-red-950/30' : ''
                                    }`}
                            >
                                <span className="text-gray-500 shrink-0 select-none">
                                    {formatTime(entry.timestamp)}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${levelBadge[entry.level]}`}>
                                    {entry.level}
                                </span>
                                <pre className={`whitespace-pre-wrap break-all ${levelColors[entry.level]}`}>
                                    {entry.message}
                                </pre>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    )
}
