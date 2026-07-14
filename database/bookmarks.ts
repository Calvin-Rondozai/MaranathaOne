import type { SQLiteDatabase } from 'expo-sqlite';

export type Bookmark = { id: number; book: string; chapter: number; verse: number; created_date: string };

export async function getBookmarksForChapter(
  db: SQLiteDatabase,
  book: string,
  chapter: number
): Promise<Set<number>> {
  const rows = await db.getAllAsync<{ verse: number }>(
    'SELECT verse FROM bookmarks WHERE book = ? AND chapter = ?',
    book,
    chapter
  );
  return new Set(rows.map((r) => r.verse));
}

export async function toggleBookmark(
  db: SQLiteDatabase,
  book: string,
  chapter: number,
  verse: number
): Promise<boolean> {
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?',
    book,
    chapter,
    verse
  );
  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', existing.id);
    return false;
  }
  await db.runAsync(
    'INSERT INTO bookmarks (book, chapter, verse, created_date) VALUES (?, ?, ?, ?)',
    book,
    chapter,
    verse,
    new Date().toISOString()
  );
  return true;
}

export async function getAllBookmarks(db: SQLiteDatabase): Promise<Bookmark[]> {
  return db.getAllAsync<Bookmark>('SELECT * FROM bookmarks ORDER BY created_date DESC');
}
