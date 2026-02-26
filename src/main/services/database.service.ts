import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import type { HistoryRecord, HistoryListResult, DictionaryWord, AppStats } from '../../shared/types'

class DatabaseServiceClass {
  private db!: Database.Database

  init(): void {
    const dbPath = join(app.getPath('userData'), 'voiceflow.db')
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')

    // 執行 schema
    const schemaPath = join(__dirname, '../db/schema.sql')
    let schema: string
    try {
      schema = readFileSync(schemaPath, 'utf-8')
    } catch {
      // fallback: inline schema for packaged app
      schema = `
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          original_text TEXT NOT NULL,
          refined_text TEXT NOT NULL,
          template TEXT NOT NULL DEFAULT 'general',
          language TEXT NOT NULL DEFAULT 'zh-TW',
          audio_duration REAL DEFAULT 0,
          char_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );
        CREATE TABLE IF NOT EXISTS dictionary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT NOT NULL UNIQUE,
          category TEXT DEFAULT 'general',
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );
        CREATE TABLE IF NOT EXISTS stats (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          total_characters INTEGER DEFAULT 0,
          total_recordings INTEGER DEFAULT 0,
          total_audio_secs REAL DEFAULT 0
        );
        INSERT OR IGNORE INTO stats (id, total_characters, total_recordings, total_audio_secs) VALUES (1, 0, 0, 0);
        CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_records_template ON records(template);
      `
    }
    this.db.exec(schema)
  }

  // === 歷史紀錄 ===
  saveRecord(record: {
    originalText: string
    refinedText: string
    template: string
    language: string
    audioDuration: number
  }): void {
    const charCount = record.refinedText.length
    const stmt = this.db.prepare(
      `INSERT INTO records (original_text, refined_text, template, language, audio_duration, char_count)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    stmt.run(
      record.originalText,
      record.refinedText,
      record.template,
      record.language,
      record.audioDuration,
      charCount
    )

    // 更新統計
    this.db
      .prepare(
        `UPDATE stats SET
        total_characters = total_characters + ?,
        total_recordings = total_recordings + 1,
        total_audio_secs = total_audio_secs + ?
        WHERE id = 1`
      )
      .run(charCount, record.audioDuration)
  }

  listRecords(page: number, limit: number): HistoryListResult {
    const offset = (page - 1) * limit
    const records = this.db
      .prepare('SELECT * FROM records ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as HistoryRecord[]
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM records').get() as { count: number }).count
    return { records, total }
  }

  searchRecords(query: string): HistoryRecord[] {
    const like = `%${query}%`
    return this.db
      .prepare(
        'SELECT * FROM records WHERE original_text LIKE ? OR refined_text LIKE ? ORDER BY created_at DESC'
      )
      .all(like, like) as HistoryRecord[]
  }

  deleteRecord(id: number): void {
    this.db.prepare('DELETE FROM records WHERE id = ?').run(id)
  }

  exportRecords(): HistoryRecord[] {
    return this.db.prepare('SELECT * FROM records ORDER BY created_at DESC').all() as HistoryRecord[]
  }

  // === 字典 ===
  listDictionary(): DictionaryWord[] {
    return this.db.prepare('SELECT * FROM dictionary ORDER BY created_at DESC').all() as DictionaryWord[]
  }

  addWord(word: string, category = 'general'): void {
    this.db.prepare('INSERT OR IGNORE INTO dictionary (word, category) VALUES (?, ?)').run(word, category)
  }

  removeWord(word: string): void {
    this.db.prepare('DELETE FROM dictionary WHERE word = ?').run(word)
  }

  importWords(words: string[]): void {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO dictionary (word) VALUES (?)')
    const insertMany = this.db.transaction((wordList: string[]) => {
      for (const w of wordList) {
        stmt.run(w.trim())
      }
    })
    insertMany(words)
  }

  getDictionaryWords(): string[] {
    const rows = this.db.prepare('SELECT word FROM dictionary').all() as { word: string }[]
    return rows.map((r) => r.word)
  }

  // === 統計 ===
  getStats(): AppStats {
    return this.db.prepare('SELECT * FROM stats WHERE id = 1').get() as AppStats
  }
}

export const DatabaseService = new DatabaseServiceClass()
