import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from '@renderer/components/Sidebar'
import Dashboard from '@renderer/pages/Dashboard'
import History from '@renderer/pages/History'
import Dictionary from '@renderer/pages/Dictionary'
import Settings from '@renderer/pages/Settings'
import TemplateEditor from '@renderer/pages/TemplateEditor'
import { useIPC } from '@renderer/hooks/useIPC'

function App(): React.JSX.Element {
  useIPC()

  return (
    <HashRouter>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/templates" element={<TemplateEditor />} />
        <Route path="/history" element={<History />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  )
}

export default App
