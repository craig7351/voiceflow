-- 歷史紀錄表
CREATE TABLE IF NOT EXISTS records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  original_text TEXT    NOT NULL,
  refined_text  TEXT    NOT NULL,
  template      TEXT    NOT NULL DEFAULT 'general',
  language      TEXT    NOT NULL DEFAULT 'zh-TW',
  audio_duration REAL   DEFAULT 0,
  char_count    INTEGER DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 自訂詞典表
CREATE TABLE IF NOT EXISTS dictionary (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  word       TEXT    NOT NULL UNIQUE,
  category   TEXT    DEFAULT 'general',
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 統計表
CREATE TABLE IF NOT EXISTS stats (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  total_characters  INTEGER DEFAULT 0,
  total_recordings  INTEGER DEFAULT 0,
  total_audio_secs  REAL    DEFAULT 0
);

-- 初始化統計資料
INSERT OR IGNORE INTO stats (id, total_characters, total_recordings, total_audio_secs)
VALUES (1, 0, 0, 0);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_template ON records(template);
