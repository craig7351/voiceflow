import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首頁', icon: '🏠' },
  { to: '/history', label: '歷史紀錄', icon: '📋' },
  { to: '/dictionary', label: '字典', icon: '📖' },
  { to: '/settings', label: '設定', icon: '⚙️' }
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          VoiceFlow
        </h1>
        <p className="text-xs text-gray-400 mt-1">AI 語音輸入助手</p>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-primary border-r-3 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">VoiceFlow v1.0.0</p>
      </div>
    </aside>
  )
}
