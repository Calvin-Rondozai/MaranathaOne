export const SCHEMA_VERSION = 8;

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS bible (
  id INTEGER PRIMARY KEY NOT NULL,
  translation TEXT NOT NULL DEFAULT 'NHEB',
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'personal',
  linked_verse TEXT,
  pinned INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'praying',
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY NOT NULL,
  habit_type TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  value INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS app_kv (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS highlights (
  id INTEGER PRIMARY KEY NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS egw_highlights (
  id INTEGER PRIMARY KEY NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  paragraph INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_date TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_type_date ON habits (habit_type, date);
CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible (translation, book, chapter, verse);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks (book, chapter, verse);
CREATE UNIQUE INDEX IF NOT EXISTS idx_highlights_verse ON highlights (book, chapter, verse);
CREATE UNIQUE INDEX IF NOT EXISTS idx_egw_highlights_para ON egw_highlights (book, chapter, paragraph);
`;
