import { getLocalizedBookName } from './bookNames';

export type BibleBook = { name: string; chapters: number; testament: 'old' | 'new' };

export const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Genesis', chapters: 50, testament: 'old' },
  { name: 'Exodus', chapters: 40, testament: 'old' },
  { name: 'Leviticus', chapters: 27, testament: 'old' },
  { name: 'Numbers', chapters: 36, testament: 'old' },
  { name: 'Deuteronomy', chapters: 34, testament: 'old' },
  { name: 'Joshua', chapters: 24, testament: 'old' },
  { name: 'Judges', chapters: 21, testament: 'old' },
  { name: 'Ruth', chapters: 4, testament: 'old' },
  { name: '1 Samuel', chapters: 31, testament: 'old' },
  { name: '2 Samuel', chapters: 24, testament: 'old' },
  { name: '1 Kings', chapters: 22, testament: 'old' },
  { name: '2 Kings', chapters: 25, testament: 'old' },
  { name: '1 Chronicles', chapters: 29, testament: 'old' },
  { name: '2 Chronicles', chapters: 36, testament: 'old' },
  { name: 'Ezra', chapters: 10, testament: 'old' },
  { name: 'Nehemiah', chapters: 13, testament: 'old' },
  { name: 'Esther', chapters: 10, testament: 'old' },
  { name: 'Job', chapters: 42, testament: 'old' },
  { name: 'Psalms', chapters: 150, testament: 'old' },
  { name: 'Proverbs', chapters: 31, testament: 'old' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'old' },
  { name: 'Song of Solomon', chapters: 8, testament: 'old' },
  { name: 'Isaiah', chapters: 66, testament: 'old' },
  { name: 'Jeremiah', chapters: 52, testament: 'old' },
  { name: 'Lamentations', chapters: 5, testament: 'old' },
  { name: 'Ezekiel', chapters: 48, testament: 'old' },
  { name: 'Daniel', chapters: 12, testament: 'old' },
  { name: 'Hosea', chapters: 14, testament: 'old' },
  { name: 'Joel', chapters: 3, testament: 'old' },
  { name: 'Amos', chapters: 9, testament: 'old' },
  { name: 'Obadiah', chapters: 1, testament: 'old' },
  { name: 'Jonah', chapters: 4, testament: 'old' },
  { name: 'Micah', chapters: 7, testament: 'old' },
  { name: 'Nahum', chapters: 3, testament: 'old' },
  { name: 'Habakkuk', chapters: 3, testament: 'old' },
  { name: 'Zephaniah', chapters: 3, testament: 'old' },
  { name: 'Haggai', chapters: 2, testament: 'old' },
  { name: 'Zechariah', chapters: 14, testament: 'old' },
  { name: 'Malachi', chapters: 4, testament: 'old' },
  { name: 'Matthew', chapters: 28, testament: 'new' },
  { name: 'Mark', chapters: 16, testament: 'new' },
  { name: 'Luke', chapters: 24, testament: 'new' },
  { name: 'John', chapters: 21, testament: 'new' },
  { name: 'Acts', chapters: 28, testament: 'new' },
  { name: 'Romans', chapters: 16, testament: 'new' },
  { name: '1 Corinthians', chapters: 16, testament: 'new' },
  { name: '2 Corinthians', chapters: 13, testament: 'new' },
  { name: 'Galatians', chapters: 6, testament: 'new' },
  { name: 'Ephesians', chapters: 6, testament: 'new' },
  { name: 'Philippians', chapters: 4, testament: 'new' },
  { name: 'Colossians', chapters: 4, testament: 'new' },
  { name: '1 Thessalonians', chapters: 5, testament: 'new' },
  { name: '2 Thessalonians', chapters: 3, testament: 'new' },
  { name: '1 Timothy', chapters: 6, testament: 'new' },
  { name: '2 Timothy', chapters: 4, testament: 'new' },
  { name: 'Titus', chapters: 3, testament: 'new' },
  { name: 'Philemon', chapters: 1, testament: 'new' },
  { name: 'Hebrews', chapters: 13, testament: 'new' },
  { name: 'James', chapters: 5, testament: 'new' },
  { name: '1 Peter', chapters: 5, testament: 'new' },
  { name: '2 Peter', chapters: 3, testament: 'new' },
  { name: '1 John', chapters: 5, testament: 'new' },
  { name: '2 John', chapters: 1, testament: 'new' },
  { name: '3 John', chapters: 1, testament: 'new' },
  { name: 'Jude', chapters: 1, testament: 'new' },
  { name: 'Revelation', chapters: 22, testament: 'new' },
];

export type ChapterRef = { book: string; chapter: number };

export function getAdjacentChapter(book: string, chapter: number, direction: 'prev' | 'next'): ChapterRef | null {
  const index = BIBLE_BOOKS.findIndex((b) => b.name === book);
  if (index === -1) return null;

  if (direction === 'next') {
    if (chapter < BIBLE_BOOKS[index].chapters) return { book, chapter: chapter + 1 };
    const nextBook = BIBLE_BOOKS[index + 1];
    return nextBook ? { book: nextBook.name, chapter: 1 } : null;
  }

  if (chapter > 1) return { book, chapter: chapter - 1 };
  const prevBook = BIBLE_BOOKS[index - 1];
  return prevBook ? { book: prevBook.name, chapter: prevBook.chapters } : null;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export type ParsedReference = { book: string; chapter: number; verse: number | null };

export function parseReference(query: string, translation?: string): ParsedReference | null {
  // The trailing (?:-\d+)? tolerates a verse range like "10:29-31" — only the
  // range's start verse is used, since navigation only needs book + chapter.
  const match = query.trim().match(/^([1-3]?\s*[a-zA-Z .]+?)\s+(\d+)(?::(\d+)(?:-\d+)?)?$/);
  if (!match) return null;

  const [, rawBook, rawChapter, rawVerse] = match;
  const target = normalize(rawBook);
  const book = BIBLE_BOOKS.find((b) => {
    if (normalize(b.name) === target || normalize(b.name).startsWith(target)) return true;
    if (!translation) return false;
    const localized = normalize(getLocalizedBookName(translation, b.name));
    return localized === target || localized.startsWith(target);
  });
  if (!book) return null;

  const chapter = Number(rawChapter);
  if (chapter < 1 || chapter > book.chapters) return null;

  return { book: book.name, chapter, verse: rawVerse ? Number(rawVerse) : null };
}
