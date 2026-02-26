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
      model: 'gemini-2.5-flash',
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
    const model = ConfigService.get('geminiModel') || 'gemini-2.5-flash'
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

  /**
   * 合併轉錄+潤稿為單次 API 呼叫，減少一次 round-trip
   */
  async transcribeAndRefine(
    filePath: string,
    options: ProcessOptions
  ): Promise<{ original: string; refined: string }> {
    const client = this.getClient()
    const model = ConfigService.get('geminiModel') || 'gemini-2.5-flash'
    const temperature = ConfigService.get('gptTemperature')
    const systemPrompt = TemplateService.getPrompt(options.template)

    const audioBytes = readFileSync(filePath)
    const base64Audio = audioBytes.toString('base64')

    const langHint =
      options.language === 'auto' ? '' : `語言為 ${options.language}。`
    const dictHint = options.customDictionary?.length
      ? `以下是專有名詞供參考：${options.customDictionary.join('、')}。`
      : ''

    // 把所有指令放到 systemInstruction，避免被混進轉錄結果
    const sysInstruction = `你是語音轉錄與潤稿助手。使用者會傳送一段音訊，你需要：
1. 將音訊精確轉錄為純文字。${langHint}${dictHint}不要包含時間戳記，只要純文字。
2. 根據以下潤稿指示對轉錄結果進行潤稿：
${systemPrompt}

以 JSON 回傳，包含 "original"（轉錄原文）和 "refined"（潤稿結果）兩個欄位。`

    const response = await client.models.generateContent({
      model,
      config: {
        temperature: temperature ?? 0.3,
        responseMimeType: 'application/json',
        systemInstruction: sysInstruction
      },
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
            { text: '請轉錄並潤稿這段音訊。' }
          ]
        }
      ]
    })

    const raw = response.text?.trim() ?? ''
    try {
      const parsed = JSON.parse(raw)
      return {
        original: parsed.original ?? '',
        refined: parsed.refined ?? parsed.original ?? ''
      }
    } catch {
      // JSON 解析失敗時，把整個回傳當作 refined
      return { original: raw, refined: raw }
    }
  }
}

export const GeminiService = new GeminiServiceClass()
