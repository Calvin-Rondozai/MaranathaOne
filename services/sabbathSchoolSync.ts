import type { SQLiteDatabase } from 'expo-sqlite';
import { getKv, setKv } from '@/database/kv';
import { hasQuarter, saveQuarter, SabbathBlock, SabbathDay, SabbathLesson, SabbathQuarterData } from '@/database/sabbathSchool';

// The official Sabbath School app (Adventech, for the GC Sabbath School & Personal
// Ministries department) has no public API — but its content repo is public, unauthenticated,
// and served as plain files over the raw.githubusercontent.com CDN (no GitHub API rate limit).
// Content itself carries a GC copyright notice restricting reproduction without written
// authorization — this app only caches it locally for the signed-in user's own offline
// reading, the same personal-use basis already applied to other copyrighted sources here.
const REPO_BASE = 'https://raw.githubusercontent.com/Adventech/sabbath-school-lessons/stage/src/en';
const LAST_SYNC_KEY = 'sabbath_school_last_sync';
const WEEKS_PER_QUARTER = 13;
const DAYS_PER_WEEK = 7;

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Sabbath School quarters run on calendar quarters (2026-01 = Jan-Mar 2026), though the
// actual start date is the last Saturday of the prior month.
export function quarterCodeForDate(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-0${quarter}`;
}

function shiftQuarter(code: string, delta: number): string {
  const [yearStr, qStr] = code.split('-');
  let year = Number(yearStr);
  let q = Number(qStr) + delta;
  while (q < 1) {
    q += 4;
    year -= 1;
  }
  while (q > 4) {
    q -= 4;
    year += 1;
  }
  return `${year}-0${q}`;
}

function parseYamlScalars(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([a-zA-Z_]+):\s*"?([^"]*)"?\s*$/);
    if (m && m[2] !== undefined && !line.trim().startsWith('-')) {
      out[m[1]] = m[2].trim();
    }
  }
  return out;
}

function parseDayFile(raw: string): { title: string; date: string; blocks: SabbathBlock[] } | null {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const meta = parseYamlScalars(fmMatch[1]);
  const body = fmMatch[2];

  const blocks: SabbathBlock[] = [];
  const lines = body.split('\n');
  let buf: string[] = [];
  let bufType: SabbathBlock['type'] = 'paragraph';
  const flush = () => {
    if (buf.length) {
      const text = cleanInline(buf.join(' '));
      if (text) blocks.push({ type: bufType, text });
    }
    buf = [];
    bufType = 'paragraph';
  };
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^#{2,6}\s+/.test(line)) {
      flush();
      blocks.push({ type: 'heading', text: cleanInline(line.replace(/^#{2,6}\s+/, '')) });
      continue;
    }
    if (/^>\s?/.test(line)) {
      if (bufType !== 'quote') flush();
      bufType = 'quote';
      buf.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (/^-{3,}\s*$/.test(line)) {
      flush();
      continue;
    }
    if (bufType === 'quote') flush();
    buf.push(line.trim());
  }
  flush();

  return { title: meta.title ?? '', date: meta.date ?? '', blocks };
}

function cleanInline(text: string): string {
  return text
    .replace(/<\/?p>/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/_\*?/g, '')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchQuarter(code: string): Promise<SabbathQuarterData | null> {
  const infoRaw = await fetchText(`${REPO_BASE}/${code}/info.yml`);
  if (!infoRaw) return null;
  const info = parseYamlScalars(infoRaw);

  const lessons: SabbathLesson[] = [];
  for (let week = 1; week <= WEEKS_PER_QUARTER; week++) {
    const weekCode = String(week).padStart(2, '0');
    const days: SabbathDay[] = [];
    for (let day = 1; day <= DAYS_PER_WEEK; day++) {
      const dayCode = String(day).padStart(2, '0');
      const raw = await fetchText(`${REPO_BASE}/${code}/${weekCode}/${dayCode}.md`);
      if (!raw) continue;
      const parsed = parseDayFile(raw);
      if (parsed) days.push({ day, title: parsed.title, date: parsed.date, blocks: parsed.blocks });
    }
    if (days.length === 0) continue;
    lessons.push({ week, title: days[0].title, startDate: days[0].date, days });
  }
  if (lessons.length === 0) return null;

  return {
    code,
    title: info.title ?? code,
    description: info.description ?? '',
    humanDate: info.human_date ?? '',
    startDate: info.start_date ?? '',
    endDate: info.end_date ?? '',
    lessons,
  };
}

export type SyncResult = { synced: boolean; code?: string; reason?: string };

// Called on app launch/foreground and from the manual Update button. Tries the current
// calendar quarter first, then adjacent ones (the real quarter boundary is the last
// Saturday of the prior month, and a new quarter's files sometimes land a few days
// late) — first one that both fetches and isn't already downloaded wins.
export async function syncSabbathSchool(db: SQLiteDatabase, options: { force?: boolean } = {}): Promise<SyncResult> {
  const today = new Date();
  const candidates = [quarterCodeForDate(today), shiftQuarter(quarterCodeForDate(today), 1), shiftQuarter(quarterCodeForDate(today), -1)];

  for (const code of candidates) {
    if (!options.force && (await hasQuarter(db, code))) continue;
    const quarter = await fetchQuarter(code);
    if (!quarter) continue;
    await saveQuarter(db, quarter);
    await setKv(db, LAST_SYNC_KEY, new Date().toISOString());
    return { synced: true, code };
  }
  return { synced: false, reason: 'No new quarter available or offline' };
}

export async function getLastSyncTime(db: SQLiteDatabase): Promise<string | null> {
  return getKv(db, LAST_SYNC_KEY);
}
