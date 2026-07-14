import type { SQLiteDatabase } from 'expo-sqlite';

export type PrayerStatus = 'praying' | 'answered';

export type Prayer = {
  id: number;
  title: string;
  content: string;
  status: PrayerStatus;
  date: string;
};

export async function getPrayers(db: SQLiteDatabase, status?: PrayerStatus): Promise<Prayer[]> {
  if (status) {
    return db.getAllAsync<Prayer>('SELECT * FROM prayer WHERE status = ? ORDER BY date DESC', status);
  }
  return db.getAllAsync<Prayer>('SELECT * FROM prayer ORDER BY date DESC');
}

export async function getPrayer(db: SQLiteDatabase, id: number): Promise<Prayer | null> {
  return db.getFirstAsync<Prayer>('SELECT * FROM prayer WHERE id = ?', id);
}

export async function createPrayer(
  db: SQLiteDatabase,
  input: { title: string; content: string }
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO prayer (title, content, status, date) VALUES (?, ?, ?, ?)',
    input.title,
    input.content,
    'praying',
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updatePrayer(
  db: SQLiteDatabase,
  id: number,
  input: { title: string; content: string }
): Promise<void> {
  await db.runAsync('UPDATE prayer SET title = ?, content = ? WHERE id = ?', input.title, input.content, id);
}

export async function deletePrayer(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM prayer WHERE id = ?', id);
}

export async function togglePrayerStatus(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    "UPDATE prayer SET status = CASE status WHEN 'praying' THEN 'answered' ELSE 'praying' END WHERE id = ?",
    id
  );
}
