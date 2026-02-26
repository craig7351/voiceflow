import OpenAI from 'openai'
import { app } from 'electron'
import { join } from 'path'
import { writeFile, unlink, createReadStream } from 'fs'
import { promisify } from 'util'
import { ConfigService } from './config.service'
import { DatabaseService } from './database.service'
import { TemplateService } from './template.service'
import type { ProcessOptions, ProcessResult } from '../../shared/types'

const writeFileAsync = promisify(writeFile)
const unlinkAsync = promisify(unlink)

class AudioProcessorServiceClass {
  async processAudio(audioBuffer: Buffer, options: ProcessOptions): Promise<ProcessResult> {
    const tempPath = join(app.getPath('temp'), `voiceflow_${Date.now()}.webm`)
    await writeFileAsync(tempPath, audioBuffer)

    try {
      // Whisper STT
      const transcript = await this.transcribe(tempPath, options)

      // GPT 潤稿
      const refined = await this.refine(transcript, options)

      // 儲存到歷史紀錄
      DatabaseService.saveRecord({
        originalText: transcript,
        refinedText: refined,
        template: options.template,
        language: options.language === 'auto' ? 'auto' : options.language,
        audioDuration: options.duration ?? 0
      })

      return { original: transcript, refined }
    } finally {
      await unlinkAsync(tempPath).catch(() => {})
    }
  }

  private async transcribe(filePath: string, options: ProcessOptions): Promise<string> {
    const client = this.getClient()
    const model = ConfigService.get('whisperModel')
    const response = await client.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: model || 'whisper-1',
      language: options.language === 'auto' ? undefined : options.language,
      prompt: options.customDictionary?.join('、')
    })
    return response.text
  }

  private async refine(text: string, options: ProcessOptions): Promise<string> {
    const client = this.getClient()
    const systemPrompt = TemplateService.getPrompt(options.template)
    const model = ConfigService.get('gptModel')
    const temperature = ConfigService.get('gptTemperature')

    const response = await client.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: temperature ?? 0.3
    })
    return response.choices[0].message.content ?? text
  }

  private getClient(): OpenAI {
    const apiKey = ConfigService.get('openaiApiKey')
    if (!apiKey) throw new Error('OpenAI API Key 尚未設定')
    return new OpenAI({ apiKey })
  }
}

export const AudioProcessorService = new AudioProcessorServiceClass()
