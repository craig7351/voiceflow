import type { TemplateConfig } from '../../shared/types'
import { ConfigService } from './config.service'

const DEFAULT_TEMPLATES: Record<string, TemplateConfig> = {
  general: {
    name: '通用',
    prompt: `你是一個繁體中文文字編輯助手。請將以下語音轉錄的文字進行修正：
1. 修正錯別字與語法錯誤
2. 適當加入標點符號
3. 保持原意，不要增刪內容
4. 輸出自然流暢的繁體中文`
  },
  notion: {
    name: 'Notion 格式',
    prompt: `你是一個 Notion 筆記格式化助手。請將語音轉錄文字整理為結構化筆記：
1. 使用 Markdown 格式（標題用 ##、重點用粗體、列表用 -）
2. 自動拆分段落
3. 在適當位置加入分隔線
4. 保持原意，修正錯字`
  },
  slack: {
    name: 'Slack 格式',
    prompt: `將以下語音轉錄文字整理為適合在 Slack 發送的訊息：
1. 語氣保持輕鬆專業
2. 適當使用 emoji
3. 簡潔有力，去除贅詞
4. 使用繁體中文`
  },
  email: {
    name: 'Email 格式',
    prompt: `將以下語音轉錄文字整理為正式的電子郵件內容：
1. 加入適當的問候語和結尾
2. 語氣正式但不生硬
3. 結構清晰，分段明確
4. 使用繁體中文`
  },
  plain: {
    name: '情侶',
    prompt: `你是一個高情商的情侶溝通助手。請將以下語音轉錄的文字，如果是生硬、簡短或難聽的語氣，轉化為溫柔、體貼、好聽的版本，但保持原本要傳達的核心意思。
1. 語氣要充滿愛意與包容
2. 適當加上可愛的語氣詞或表情符號（如：💕、🥺、😘）
3. 繁體中文輸出，不要有 AI 機器感`
  }
}

class TemplateServiceClass {
  getPrompt(templateId: string): string {
    // 優先使用使用者自訂的 prompt
    const custom = ConfigService.get('customTemplates')
    if (custom?.[templateId]?.prompt) {
      return custom[templateId].prompt
    }
    return DEFAULT_TEMPLATES[templateId]?.prompt ?? DEFAULT_TEMPLATES.general.prompt
  }

  getTemplateName(templateId: string): string {
    const custom = ConfigService.get('customTemplates')
    if (custom?.[templateId]?.name) {
      return custom[templateId].name
    }
    return DEFAULT_TEMPLATES[templateId]?.name ?? '通用'
  }

  getAllTemplates(): Record<string, TemplateConfig> {
    const custom = ConfigService.get('customTemplates') || {}
    // 合併：custom 覆蓋 default
    const merged: Record<string, TemplateConfig> = {}
    for (const [id, tpl] of Object.entries(DEFAULT_TEMPLATES)) {
      merged[id] = custom[id]
        ? { name: custom[id].name || tpl.name, prompt: custom[id].prompt || tpl.prompt }
        : { ...tpl }
    }
    // 加入使用者新增的模板（不在 default 中的）
    for (const [id, tpl] of Object.entries(custom)) {
      if (!merged[id]) {
        merged[id] = { ...tpl }
      }
    }
    return merged
  }

  getDefaultTemplates(): Record<string, TemplateConfig> {
    return { ...DEFAULT_TEMPLATES }
  }

  setCustomTemplate(templateId: string, config: TemplateConfig): void {
    const custom = ConfigService.get('customTemplates') || {}
    custom[templateId] = config
    ConfigService.set('customTemplates', custom)
  }

  resetTemplate(templateId: string): void {
    const custom = ConfigService.get('customTemplates') || {}
    delete custom[templateId]
    ConfigService.set('customTemplates', custom)
  }

  deleteCustomTemplate(templateId: string): void {
    // 只能刪除非預設模板
    if (DEFAULT_TEMPLATES[templateId]) return
    const custom = ConfigService.get('customTemplates') || {}
    delete custom[templateId]
    ConfigService.set('customTemplates', custom)
  }
}

export const TemplateService = new TemplateServiceClass()
