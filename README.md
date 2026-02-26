# VoiceFlow 🎙️

> 跨平台 AI 語音輸入助手，讓你的聲音成為最強大的生產力工具。

VoiceFlow 是一款基於 Electron 的開源跨平台 AI 語音輸入工具。在任何應用程式中按下全域熱鍵即可錄音，語音將透過 AI 模型轉為文字並進行智慧潤稿，最終自動貼上到您當前的焦點視窗中。

**🔒 隱私與安全**：所有語音資料完全透過您自帶的 API Key 處理，不經過任何第三方伺服器，保障 100% 的資料主權與隱私安全。API Key 加密儲存於本機。

---

## ✨ 核心功能

### ⌨️ 全域熱鍵
- 在任何環境下按下熱鍵（預設 `Ctrl+Shift+Space` / `Cmd+Shift+Space`）開始/停止錄音
- 支援一鍵取消錄音

### 🤖 雙 AI 引擎支援
支援自由切換兩大 AI 平台：

| 功能 | OpenAI | Google Gemini |
|------|--------|---------------|
| 語音轉文字 | Whisper API | Gemini 內建音訊處理 |
| 智慧潤稿 | GPT-4o / GPT-4o Mini / GPT-4 Turbo | Gemini 2.5 Flash / Flash-Lite / Pro |
| 處理方式 | 兩步驟（STT → GPT） | 單次 API 呼叫（轉錄+潤稿合併） |

**Gemini 模型比較：**
| 模型 | 特點 | 輸入價格 | 輸出價格 |
|------|------|---------|---------|
| Gemini 2.5 Flash | 最佳性價比，速度快品質好 | $0.15/1M tokens | $0.60/1M tokens |
| Gemini 2.5 Flash-Lite | 最快最便宜 | $0.075/1M tokens | $0.30/1M tokens |
| Gemini 2.5 Pro | 最高品質，適合複雜任務 | $1.25/1M tokens | $10.00/1M tokens |

### 📝 智慧語意潤稿
- 自動將口語轉錄結果進行錯字修正、加入標點符號與排版調整
- 可調整 AI 溫度參數（0~1），控制輸出的創意程度
  - **0 ~ 0.3**：精確穩定，適合轉錄、翻譯
  - **0.5 ~ 0.7**：平衡，適合信件、摘要
  - **0.8 ~ 1.0**：有創意，適合文案寫作

### 🗂️ 情境模板系統
內建 5 種輸出格式，一鍵切換：
| 模板 | 說明 |
|------|------|
| 📝 通用 | 修正錯字、加入標點、保持原意 |
| 📓 Notion | 結構化 Markdown 筆記格式 |
| 💬 Slack | 輕鬆專業的訊息風格，搭配 emoji |
| 📧 Email | 正式電子郵件格式，含問候語與結尾 |
| 💕 情侶 | 把生硬簡短的文字修飾成溫柔好聽的版本 |

### 📋 跨介面自動貼上
完成處理後，自動模擬貼上快捷鍵，將文字無縫輸入至當前前景應用程式。

### 📖 自訂專屬詞典
- 新增個人專有名詞或行業術語
- 大幅提升專有詞彙的辨識正確率
- 支援批次匯入

### 🕰️ 本機歷史紀錄
- 自動將每次轉錄紀錄存放於 SQLite 資料庫
- 支援搜尋、瀏覽與重新複製
- 可匯出紀錄

### 🌍 多語言支援
- 介面使用繁體中文
- 轉錄支援多國語言
- 內建自動語言偵測

### 🐛 除錯工具
- 內建 Debug 面板，即時查看處理流程與時間
- 可隨時開關，不影響正常使用

---

## 📸 功能預覽

### 儀表板
- 即時錄音狀態指示器（idle → recording → processing → done）
- 累積字數與錄音次數統計
- 情境模板快速選擇
- 最近輸出預覽（原始轉錄 vs AI 潤稿）
- 顯示目前使用的 AI 模型名稱

### 設定頁面
- AI 服務提供商切換（OpenAI / Gemini）
- API Key 加密儲存
- 模型選擇（含 Tooltip 說明各模型特點與價格）
- 溫度參數調整（含 Tooltip 說明建議值）
- 快捷鍵設定
- 行為設定（自動複製、音效等）

### 歷史紀錄
- 完整轉錄歷史列表
- 關鍵字搜尋
- 一鍵複製與匯出

### 字典管理
- 新增/刪除專有名詞
- 批次匯入功能

---

## 🛠️ 技術架構

| 類別 | 技術 |
|------|------|
| **框架** | Electron 33+ |
| **前端** | React 19 · TypeScript · Tailwind CSS 4 |
| **狀態管理** | Zustand |
| **建構工具** | Vite · electron-vite |
| **資料庫** | better-sqlite3 |
| **加密儲存** | electron-store |
| **AI 整合** | OpenAI API · Google Gemini API (@google/genai) |
| **鍵盤模擬** | @nut-tree/nut-js |

### 專案結構
```
src/
├── main/                      # Electron 主進程
│   ├── services/
│   │   ├── audio.service.ts     # 音訊處理核心邏輯
│   │   ├── gemini.service.ts    # Google Gemini API 整合
│   │   ├── config.service.ts    # 設定管理（加密儲存）
│   │   ├── database.service.ts  # SQLite 歷史紀錄
│   │   ├── hotkey.service.ts    # 全域熱鍵註冊
│   │   ├── paste.service.ts     # 跨平台自動貼上
│   │   ├── template.service.ts  # 情境模板管理
│   │   └── updater.service.ts   # 自動更新
│   └── index.ts
├── renderer/                  # React 前端
│   └── src/
│       ├── components/          # UI 元件
│       │   ├── DebugPanel.tsx     # 除錯面板
│       │   ├── OutputPreview.tsx  # 輸出預覽
│       │   ├── RecordingIndicator.tsx
│       │   ├── Sidebar.tsx
│       │   ├── StatusCard.tsx
│       │   └── TemplateSelector.tsx
│       ├── pages/               # 頁面
│       │   ├── Dashboard.tsx      # 儀表板
│       │   ├── Settings.tsx       # 設定
│       │   ├── History.tsx        # 歷史紀錄
│       │   └── Dictionary.tsx     # 字典管理
│       ├── hooks/               # 自訂 Hooks
│       │   ├── useRecorder.ts     # 錄音控制
│       │   └── useIPC.ts          # 主進程通訊
│       └── stores/              # 狀態管理
│           └── appStore.ts
└── shared/                    # 共用型別定義
    └── types.ts
```

---

## 🚀 快速開始

### 前置需求
- Node.js 18+
- npm 或 yarn
- OpenAI API Key 或 Google Gemini API Key

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

### 4. 設定 API Key
啟動應用程式後，前往「設定」頁面：
1. 選擇 AI 服務提供商（OpenAI 或 Gemini）
2. 輸入對應的 API Key
3. 選擇模型與溫度參數
4. 開始使用！

---

## 💡 使用提示

| 場景 | 建議設定 |
|------|---------|
| 會議紀錄 | 模板：通用 · 溫度：0.2 · 模型：Flash |
| 寫 Email | 模板：Email · 溫度：0.5 · 模型：Flash |
| Slack 訊息 | 模板：Slack · 溫度：0.5 · 模型：Flash-Lite |
| 技術文件 | 模板：Notion · 溫度：0.2 · 模型：Flash |
| 快速筆記 | 模板：純文字 · 溫度：0.1 · 模型：Flash-Lite |

---

## 💡 IDE 推薦設定
推薦使用 **VSCode** 搭配以下套件進行開發：
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 📄 授權條款
MIT License
