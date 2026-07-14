import type { SQLiteDatabase } from 'expo-sqlite';

export type NoteCategory = 'bible_study' | 'prayer' | 'devotional' | 'sermon' | 'reflection' | 'personal';

export const NOTE_CATEGORIES: { key: NoteCategory; label: string }[] = [
  { key: 'bible_study', label: 'Bible Study' },
  { key: 'prayer', label: 'Prayer' },
  { key: 'devotional', label: 'Devotional' },
  { key: 'sermon', label: 'Sermon' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'personal', label: 'Personal' },
];

export type Note = {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  linked_verse: string | null;
  pinned: number;
  archived: number;
  reminder_time: string | null;
  reminder_enabled: number;
  checklist: string | null;
  created_date: string;
};

export type ChecklistItem = { id: string; text: string; done: boolean };

export function parseChecklist(checklist: string | null): ChecklistItem[] {
  if (!checklist) return [];
  try {
    return JSON.parse(checklist);
  } catch {
    return [];
  }
}

export function stringifyChecklist(items: ChecklistItem[]): string | null {
  return items.length ? JSON.stringify(items) : null;
}

export function formatVerseRef(book: string, chapter: number, verse: number): string {
  return `${book} ${chapter}:${verse}`;
}

export function formatVerseRefMulti(book: string, chapter: number, verses: number[]): string {
  const sorted = [...verses].sort((a, b) => a - b);
  const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  const verseLabel = isContiguous && sorted.length > 1 ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
  return `${book} ${chapter}:${verseLabel}`;
}

export async function getNotes(
  db: SQLiteDatabase,
  options: { search?: string; category?: NoteCategory; archived?: boolean } = {}
): Promise<Note[]> {
  const { search, category, archived = false } = options;
  const clauses = ['archived = ?'];
  const params: (string | number)[] = [archived ? 1 : 0];

  if (category) {
    clauses.push('category = ?');
    params.push(category);
  }
  if (search && search.trim()) {
    clauses.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  return db.getAllAsync<Note>(
    `SELECT * FROM notes WHERE ${clauses.join(' AND ')} ORDER BY pinned DESC, created_date DESC`,
    params
  );
}

export async function getNote(db: SQLiteDatabase, id: number): Promise<Note | null> {
  return db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', id);
}

export async function createNote(
  db: SQLiteDatabase,
  input: { title: string; content: string; category: NoteCategory; linked_verse?: string | null; checklist?: ChecklistItem[] }
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO notes (title, content, category, linked_verse, pinned, archived, checklist, created_date) VALUES (?, ?, ?, ?, 0, 0, ?, ?)',
    input.title,
    input.content,
    input.category,
    input.linked_verse ?? null,
    stringifyChecklist(input.checklist ?? []),
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateNote(
  db: SQLiteDatabase,
  id: number,
  input: { title: string; content: string; category: NoteCategory; checklist?: ChecklistItem[] }
): Promise<void> {
  await db.runAsync(
    'UPDATE notes SET title = ?, content = ?, category = ?, checklist = ? WHERE id = ?',
    input.title,
    input.content,
    input.category,
    stringifyChecklist(input.checklist ?? []),
    id
  );
}

export async function setNoteReminder(
  db: SQLiteDatabase,
  id: number,
  time: string | null,
  enabled: boolean
): Promise<void> {
  await db.runAsync(
    'UPDATE notes SET reminder_time = ?, reminder_enabled = ? WHERE id = ?',
    time,
    enabled ? 1 : 0,
    id
  );
}

export async function deleteNote(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

export async function toggleNotePinned(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE notes SET pinned = 1 - pinned WHERE id = ?', id);
}

export async function toggleNoteArchived(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE notes SET archived = 1 - archived WHERE id = ?', id);
}

export async function getNotesForVerse(db: SQLiteDatabase, verseRef: string): Promise<Note[]> {
  return db.getAllAsync<Note>(
    'SELECT * FROM notes WHERE linked_verse = ? AND archived = 0 ORDER BY created_date DESC',
    verseRef
  );
}

export async function getVersesWithNotes(db: SQLiteDatabase, book: string, chapter: number): Promise<Set<number>> {
  const rows = await db.getAllAsync<{ linked_verse: string }>(
    'SELECT DISTINCT linked_verse FROM notes WHERE archived = 0 AND linked_verse LIKE ?',
    `${book} ${chapter}:%`
  );
  const verses = new Set<number>();
  for (const row of rows) {
    const verseNumber = Number(row.linked_verse.split(':').pop());
    if (!Number.isNaN(verseNumber)) verses.add(verseNumber);
  }
  return verses;
}
