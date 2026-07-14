import type { SQLiteDatabase } from 'expo-sqlite';
import { HighlightColor } from './highlights';

export async function getEgwHighlightsForChapter(
  db: SQLiteDatabase,
  book: string,
  chapter: number
): Promise<Map<number, HighlightColor>> {
  const rows = await db.getAllAsync<{ paragraph: number; color: HighlightColor }>(
    'SELECT paragraph, color FROM egw_highlights WHERE book = ? AND chapter = ?',
    book,
    chapter
  );
  return new Map(rows.map((r) => [r.paragraph, r.color]));
}

export async function toggleEgwHighlightColor(
  db: SQLiteDatabase,
  book: string,
  chapter: number,
  paragraph: number,
  color: HighlightColor
): Promise<HighlightColor | null> {
  const existing = await db.getFirstAsync<{ id: number; color: HighlightColor }>(
    'SELECT id, color FROM egw_highlights WHERE book = ? AND chapter = ? AND paragraph = ?',
    book,
    chapter,
    paragraph
  );

  if (existing && existing.color === color) {
    await db.runAsync('DELETE FROM egw_highlights WHERE id = ?', existing.id);
    return null;
  }
  if (existing) {
    await db.runAsync('UPDATE egw_highlights SET color = ? WHERE id = ?', color, existing.id);
    return color;
  }
  await db.runAsync(
    'INSERT INTO egw_highlights (book, chapter, paragraph, color, created_date) VALUES (?, ?, ?, ?, ?)',
    book,
    chapter,
    paragraph,
    color,
    new Date().toISOString()
  );
  return color;
}
