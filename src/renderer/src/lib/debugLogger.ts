// Debug Logger - 攔截 console 並儲存日誌供 UI 顯示

export interface LogEntry {
  id: number
  level: 'log' | 'warn' | 'error' | 'info'
  message: string
  timestamp: Date
}

const MAX_LOGS = 500
let logs: LogEntry[] = []
let nextId = 1
let listeners: Array<() => void> = []
let enabled = false

function notify(): void {
  listeners.forEach((fn) => fn())
}

export function isDebugEnabled(): boolean {
  return enabled
}

export function setDebugEnabled(value: boolean): void {
  enabled = value
  if (value) {
    addLog('info', ['🐛 Debug 記錄已啟用'])
  }
  notify()
}

export function getLogs(): LogEntry[] {
  return logs
}

export function clearLogs(): void {
  logs = []
  nextId = 1
  notify()
}

export function subscribe(fn: () => void): () => void {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

function addLog(level: LogEntry['level'], args: unknown[]): void {
  if (!enabled) return
  const message = args
    .map((a) => {
      if (typeof a === 'string') return a
      try {
        return JSON.stringify(a, null, 2)
      } catch {
        return String(a)
      }
    })
    .join(' ')

  logs = [
    ...logs.slice(-(MAX_LOGS - 1)),
    { id: nextId++, level, message, timestamp: new Date() }
  ]
  notify()
}

// 攔截 console 方法
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console)
}

export function installDebugLogger(): void {
  console.log = (...args: unknown[]) => {
    originalConsole.log(...args)
    addLog('log', args)
  }
  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args)
    addLog('warn', args)
  }
  console.error = (...args: unknown[]) => {
    originalConsole.error(...args)
    addLog('error', args)
  }
  console.info = (...args: unknown[]) => {
    originalConsole.info(...args)
    addLog('info', args)
  }

  // 攔截未處理的錯誤
  window.addEventListener('error', (event) => {
    addLog('error', [`[Uncaught] ${event.message} at ${event.filename}:${event.lineno}`])
  })

  window.addEventListener('unhandledrejection', (event) => {
    addLog('error', [`[UnhandledRejection] ${event.reason}`])
  })

  // 初始化日誌
  addLog('info', ['🐛 Debug Logger 已啟動'])
  addLog('info', [`Platform: ${navigator.platform}, UserAgent: ${navigator.userAgent.slice(0, 80)}...`])
}
