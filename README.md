# VoiceFlow 🎙️

> 跨平台 AI 語音輸入助手，讓你的聲音成為最強大的生產力工具。

VoiceFlow 是一款基於 Electron 的開源跨平台 AI 語音輸入工具。在任何應用程式中按下全域熱鍵即可錄音，語音將透過 OpenAI Whisper API 轉為繁體中文文字，並由 GPT 模型進行智慧潤稿，最終自動貼上到您當前使用的焦點視窗中，如同 [Typeless](https://www.typeless.com) 的體驗。

**🔒 隱私與安全**：所有的語音資料完全透過您自帶的 OpenAI API Key 處理，過程不經過任何第三方伺服器，保障 100% 的資料主權與隱私安全。您的 API Key 將加密儲存於本機。

## ✨ 核心功能
- **⌨️ 全域熱鍵**：在任何環境下按下熱鍵（預設為 `Ctrl+Shift+Space` 或 `Cmd+Shift+Space`）隨時開始/停止錄音，支援一鍵直接取消。
- **📝 AI 語音識別 (STT)**：整合 OpenAI Whisper API，提供極高精準度的語音識別體驗。
- **🤖 智慧語意潤稿**：自動將口語轉錄結果交由 GPT 模型處理，進行錯字修正、加入適當的標點符號與排版調整。
- **📋 跨介面自動貼上**：完成處理後，自動模擬貼上快捷鍵，將文字無縫輸入至您當前所在的前景應用程式。
- **🗂️ 情境模板系統**：內建豐富的輸出格式（通用、Notion Markdown 格式、Slack 訊息風格、正式 Email、純文字等）。
- **📖 自訂專屬詞典**：可新增個人專有名詞或行業術語，大幅提升專有詞彙的正確率。
- **🕰️ 本機歷史紀錄**：自動將每次轉錄紀錄永久存放於 SQLite 資料庫，隨時可瀏覽、搜尋與重新複製。
- **🌍 多語言自動偵測**：介面支援繁體中文，轉錄支援多國語言與自動語言偵測。

## 🛠️ 技術架構
- **框架**：Electron 33+ (跨平台桌面引擎)
- **UI 與狀態管理**：React 19 ; TypeScript ; Tailwind CSS 4 ; Zustand
- **構建工具**：Vite ; electron-vite
- **資料庫與本地儲存**：better-sqlite3 ; electron-store (具備加密保護)
- **核心整合**：OpenAI 官方 API ; @nut-tree/nut-js (本機模擬按鍵)

## 🚀 專案設置與啟動

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式
```bash
npm run dev
```

### 3. 編譯與打包

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 💡 IDE 推薦設定
推薦使用 **VSCode** 搭配以下套件進行開發：
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 📄 授權條款
MIT License
