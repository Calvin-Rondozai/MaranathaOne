import type { SQLiteDatabase } from 'expo-sqlite';

export type SabbathBlock = { type: 'heading' | 'quote' | 'paragraph'; text: string };
export type SabbathDay = { day: number; title: string; date: string; blocks: SabbathBlock[] };
export type SabbathLesson = { week: number; title: string; startDate: string; days: SabbathDay[] };
export type SabbathQuarterData = {
  id: string;
  code: string;
  lang: string;
  edition: string;
  title: string;
  description: string;
  humanDate: string;
  startDate: string;
  endDate: string;
  lessons: SabbathLesson[];
};

export type SabbathQuarterRow = {
  id: string;
  code: string;
  lang: string;
  edition: string;
  title: string;
  description: string;
  human_date: string;
  start_date: string;
  end_date: string;
  downloaded_at: string;
};

export const SABBATH_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'sn', label: 'chiShona' },
];

export const SABBATH_EDITIONS: { code: string; label: string; suffix: string }[] = [
  { code: 'standard', label: 'Standard Edition', suffix: '' },
  { code: 'easy', label: 'Easy Reading Edition', suffix: '-er' },
];

export function quarterVariantId(lang: string, code: string, edition: string): string {
  return `${lang}:${code}:${edition}`;
}

export async function getDownloadedQuarters(db: SQLiteDatabase): Promise<SabbathQuarterRow[]> {
  return db.getAllAsync<SabbathQuarterRow>(
    'SELECT id, code, lang, edition, title, description, human_date, start_date, end_date, downloaded_at FROM sabbath_quarters ORDER BY code DESC'
  );
}

export async function hasQuarter(db: SQLiteDatabase, id: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM sabbath_quarters WHERE id = ?', id);
  return !!row;
}

export async function getQuarterData(db: SQLiteDatabase, id: string): Promise<SabbathQuarterData | null> {
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM sabbath_quarters WHERE id = ?', id);
  if (!row) return null;
  return JSON.parse(row.data);
}

export async function saveQuarter(db: SQLiteDatabase, quarter: SabbathQuarterData): Promise<void> {
  await db.runAsync(
    `INSERT INTO sabbath_quarters (id, code, lang, edition, title, description, human_date, start_date, end_date, data, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title, description = excluded.description, human_date = excluded.human_date,
       start_date = excluded.start_date, end_date = excluded.end_date, data = excluded.data,
       downloaded_at = excluded.downloaded_at`,
    quarter.id,
    quarter.code,
    quarter.lang,
    quarter.edition,
    quarter.title,
    quarter.description,
    quarter.humanDate,
    quarter.startDate,
    quarter.endDate,
    JSON.stringify(quarter),
    new Date().toISOString()
  );
}

export async function deleteQuarter(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM sabbath_quarters WHERE id = ?', id);
}

// Dates in the source content are "DD/MM/YYYY".
function parseSourceDate(s: string): number {
  const [d, m, y] = s.split('/').map(Number);
  if (!d || !m || !y) return NaN;
  return Date.UTC(y, m - 1, d);
}

export type TodaysLesson = { quarterId: string; quarterTitle: string; week: number; lessonTitle: string };

// The lesson whose Sabbath (day 1) date is the most recent one on or before today,
// checked across every downloaded quarter/language/edition on the device — first
// preference goes to the standard English one if more than one qualifies.
export async function getTodaysLesson(db: SQLiteDatabase, date: Date = new Date()): Promise<TodaysLesson | null> {
  const todayUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const rows = await getDownloadedQuarters(db);
  let best: TodaysLesson | null = null;
  let bestTime = -Infinity;

  for (const row of rows) {
    const quarter = await getQuarterData(db, row.id);
    if (!quarter) continue;
    for (const lesson of quarter.lessons) {
      const t = parseSourceDate(lesson.startDate);
      if (Number.isNaN(t) || t > todayUTC) continue;
      if (t > bestTime) {
        bestTime = t;
        best = { quarterId: quarter.id, quarterTitle: quarter.title, week: lesson.week, lessonTitle: lesson.title };
      }
    }
  }
  return best;
}
