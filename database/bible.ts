import type { SQLiteDatabase } from 'expo-sqlite';

export type Verse = { id: number; translation: string; book: string; chapter: number; verse: number; text: string };

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

// A plain `dayOfYear % count` offset increments by 1 each day, so consecutive days
// landed on consecutive verses in id order — it just walked straight through Genesis.
// Knuth's multiplicative hash scatters sequential day-seeds across the whole range so
// the daily verse actually looks random, while staying deterministic (same verse for
// everyone on a given day, stable if you reopen the app later that day).
function scatter(seed: number, count: number): number {
  return (Math.imul(seed, 2654435761) >>> 0) % count;
}

export async function getVerseOfDay(
  db: SQLiteDatabase,
  translation: string,
  date: Date = new Date()
): Promise<Verse | null> {
  const { count } = (await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bible WHERE translation = ?',
    translation
  )) ?? { count: 0 };
  if (count === 0) return null;
  const seed = date.getUTCFullYear() * 400 + dayOfYear(date);
  const offset = scatter(seed, count);
  return db.getFirstAsync<Verse>(
    'SELECT * FROM bible WHERE translation = ? ORDER BY id LIMIT 1 OFFSET ?',
    translation,
    offset
  );
}

export async function getChapterVerses(
  db: SQLiteDatabase,
  translation: string,
  book: string,
  chapter: number
): Promise<Verse[]> {
  return db.getAllAsync<Verse>(
    'SELECT * FROM bible WHERE translation = ? AND book = ? AND chapter = ? ORDER BY verse',
    translation,
    book,
    chapter
  );
}

export async function getVerseRange(
  db: SQLiteDatabase,
  translation: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): Promise<Verse[]> {
  return db.getAllAsync<Verse>(
    'SELECT * FROM bible WHERE translation = ? AND book = ? AND chapter = ? AND verse >= ? AND verse <= ? ORDER BY verse',
    translation,
    book,
    chapter,
    verseStart,
    verseEnd ?? verseStart
  );
}

export async function searchVerses(
  db: SQLiteDatabase,
  translation: string,
  query: string,
  limit = 50
): Promise<Verse[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  return db.getAllAsync<Verse>(
    'SELECT * FROM bible WHERE translation = ? AND text LIKE ? ORDER BY id LIMIT ?',
    translation,
    `%${trimmed}%`,
    limit
  );
}
