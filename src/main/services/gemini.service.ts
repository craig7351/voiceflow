import { GoogleGenAI } from '@google/genai'
import { readFileSync } from 'fs'
import { ConfigService } from './config.service'
import { TemplateService } from './template.service'
import type { ProcessOptions } from '../../shared/types'

class GeminiServiceClass {
  private getClient(): GoogleGenAI {
    const apiKey = ConfigService.get('geminiApiKey')
    if (!apiKey) throw new Error('Gemini API Key 尚未設定')
    return new GoogleGenAI({ apiKey })
  }

  async transcribe(filePath: string, options: ProcessOptions): Promise<string> {
    const client = this.getClient()

    const audioBytes = readFileSync(filePath)
    const base64Audio = audioBytes.toString('base64')

    const langHint =
      options.language === 'auto' ? '' : `語言為 ${options.language}。`
    const dictHint = options.customDictionary?.length
      ? `以下是專有名詞供參考：${options.customDictionary.join('、')}。`
      : ''

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Audio
              }
            },
            {
              text: `請將這段音訊精確地轉錄為文字。${langHint}${dictHint}只回傳轉錄的純文字內容，不要加任何額外說明。`
            }
          ]
        }
      ]
    })

    return response.text?.trim() ?? ''
  }

  async refine(text: string, options: ProcessOptions): Promise<string> {
    const client = this.getClient()
    const systemPrompt = TemplateService.getPrompt(options.template)
    const model = ConfigService.get('geminiModel') || 'gemini-2.0-flash'
    const temperature = ConfigService.get('gptTemperature')

    const response = await client.models.generateContent({
      model,
      config: {
        temperature: temperature ?? 0.3,
        systemInstruction: systemPrompt
      },
      contents: [
        {
          role: 'user',
          parts: [{ text }]
        }
      ]
    })

    return response.text?.trim() ?? text
  }
}

export const GeminiService = new GeminiServiceClass()
