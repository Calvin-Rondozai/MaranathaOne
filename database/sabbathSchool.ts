import type { SQLiteDatabase } from 'expo-sqlite';

export type SabbathBlock = { type: 'heading' | 'quote' | 'paragraph'; text: string };
export type SabbathDay = { day: number; title: string; date: string; blocks: SabbathBlock[] };
export type SabbathLesson = { week: number; title: string; startDate: string; days: SabbathDay[] };
export type SabbathQuarterData = {
  code: string;
  title: string;
  description: string;
  humanDate: string;
  startDate: string;
  endDate: string;
  lessons: SabbathLesson[];
};

export type SabbathQuarterRow = {
  code: string;
  title: string;
  description: string;
  human_date: string;
  start_date: string;
  end_date: string;
  downloaded_at: string;
};

export async function getDownloadedQuarters(db: SQLiteDatabase): Promise<SabbathQuarterRow[]> {
  return db.getAllAsync<SabbathQuarterRow>(
    'SELECT code, title, description, human_date, start_date, end_date, downloaded_at FROM sabbath_quarters ORDER BY code DESC'
  );
}

export async function hasQuarter(db: SQLiteDatabase, code: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ code: string }>('SELECT code FROM sabbath_quarters WHERE code = ?', code);
  return !!row;
}

export async function getQuarterData(db: SQLiteDatabase, code: string): Promise<SabbathQuarterData | null> {
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM sabbath_quarters WHERE code = ?', code);
  if (!row) return null;
  return JSON.parse(row.data);
}

export async function saveQuarter(db: SQLiteDatabase, quarter: SabbathQuarterData): Promise<void> {
  await db.runAsync(
    `INSERT INTO sabbath_quarters (code, title, description, human_date, start_date, end_date, data, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(code) DO UPDATE SET
       title = excluded.title, description = excluded.description, human_date = excluded.human_date,
       start_date = excluded.start_date, end_date = excluded.end_date, data = excluded.data,
       downloaded_at = excluded.downloaded_at`,
    quarter.code,
    quarter.title,
    quarter.description,
    quarter.humanDate,
    quarter.startDate,
    quarter.endDate,
    JSON.stringify(quarter),
    new Date().toISOString()
  );
}

export async function deleteQuarter(db: SQLiteDatabase, code: string): Promise<void> {
  await db.runAsync('DELETE FROM sabbath_quarters WHERE code = ?', code);
}
