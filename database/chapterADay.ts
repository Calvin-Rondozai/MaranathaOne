import { BIBLE_BOOKS } from './bibleBooks';

export type ChapterADayEntry = { book: string; chapter: number };

// A fixed reference point: Jan 1, 2024 = Genesis 1. The plan just cycles through every
// chapter in canonical order (Genesis 1 → Revelation 22, then back to Genesis 1),
// so "today's chapter" is always computable from the date alone — no authored
// 365/366-day list to maintain, and it never runs out.
const EPOCH_UTC = Date.UTC(2024, 0, 1);

const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);

function chapterAtIndex(index: number): ChapterADayEntry {
  let i = index;
  for (const book of BIBLE_BOOKS) {
    if (i < book.chapters) return { book: book.name, chapter: i + 1 };
    i -= book.chapters;
  }
  return { book: BIBLE_BOOKS[0].name, chapter: 1 };
}

export function getChapterADay(date: Date = new Date()): ChapterADayEntry {
  const todayUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceEpoch = Math.floor((todayUTC - EPOCH_UTC) / 86_400_000);
  const index = ((daysSinceEpoch % TOTAL_CHAPTERS) + TOTAL_CHAPTERS) % TOTAL_CHAPTERS;
  return chapterAtIndex(index);
}
