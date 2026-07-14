export type CommentaryEntry = { verseStart: number; verseEnd: number; content: string };
export type CommentaryChapter = { number: number; entries: CommentaryEntry[] };
export type CommentaryBook = { name: string; chapters: CommentaryChapter[] };
export type CommentaryVolume = { code: string; title: string; author: string; books: CommentaryBook[] };

export const COMMENTARY_VOLUMES = [
  { code: 'sdabc1', title: 'S.D.A. Bible Commentary, vol. 1' },
  { code: 'sdabc2', title: 'S.D.A. Bible Commentary, vol. 2' },
  { code: 'sdabc3', title: 'S.D.A. Bible Commentary, vol. 3' },
  { code: 'sdabc4', title: 'S.D.A. Bible Commentary, vol. 4' },
  { code: 'sdabc5', title: 'S.D.A. Bible Commentary, vol. 5' },
  { code: 'sdabc6', title: 'S.D.A. Bible Commentary, vol. 6' },
];

// Which volume covers a given Bible book — generated from what's actually present in
// these 6 volumes; a book not listed here has no commentary available in this set.
const BOOK_TO_VOLUME: Record<string, string> = {
  Genesis: 'sdabc1', Exodus: 'sdabc1', Leviticus: 'sdabc1', Numbers: 'sdabc1', Deuteronomy: 'sdabc1',
  Joshua: 'sdabc2', '1 Samuel': 'sdabc2', '2 Samuel': 'sdabc2', '1 Kings': 'sdabc2', '2 Kings': 'sdabc2',
  '1 Chronicles': 'sdabc3', '2 Chronicles': 'sdabc3', Ezra: 'sdabc3', Nehemiah: 'sdabc3', Esther: 'sdabc3',
  Job: 'sdabc3', Proverbs: 'sdabc3', Ecclesiastes: 'sdabc3',
  Isaiah: 'sdabc4', Jeremiah: 'sdabc4', Ezekiel: 'sdabc4', Daniel: 'sdabc4', Hosea: 'sdabc4',
  Haggai: 'sdabc4', Zechariah: 'sdabc4', Malachi: 'sdabc4',
  Matthew: 'sdabc5', Luke: 'sdabc5', John: 'sdabc5',
  Acts: 'sdabc6', Romans: 'sdabc6', '1 Corinthians': 'sdabc6', Ephesians: 'sdabc6',
};

const VOLUME_DATA: Partial<Record<string, CommentaryVolume>> = {};

function loadVolume(code: string): CommentaryVolume | undefined {
  if (!VOLUME_DATA[code]) {
    switch (code) {
      case 'sdabc1': VOLUME_DATA.sdabc1 = require('./sdaCommentary1.json'); break;
      case 'sdabc2': VOLUME_DATA.sdabc2 = require('./sdaCommentary2.json'); break;
      case 'sdabc3': VOLUME_DATA.sdabc3 = require('./sdaCommentary3.json'); break;
      case 'sdabc4': VOLUME_DATA.sdabc4 = require('./sdaCommentary4.json'); break;
      case 'sdabc5': VOLUME_DATA.sdabc5 = require('./sdaCommentary5.json'); break;
      case 'sdabc6': VOLUME_DATA.sdabc6 = require('./sdaCommentary6.json'); break;
      default: return undefined;
    }
  }
  return VOLUME_DATA[code];
}

export function getCommentaryVolume(code: string): CommentaryVolume | undefined {
  return loadVolume(code);
}

export function volumeCodeForBook(book: string): string | undefined {
  return BOOK_TO_VOLUME[book];
}

export function getCommentaryChapters(book: string): CommentaryChapter[] {
  const code = BOOK_TO_VOLUME[book];
  if (!code) return [];
  const vol = loadVolume(code);
  return vol?.books.find((b) => b.name === book)?.chapters ?? [];
}

export function getCommentaryChapter(book: string, chapter: number): CommentaryChapter | undefined {
  const code = BOOK_TO_VOLUME[book];
  if (!code) return undefined;
  const vol = loadVolume(code);
  return vol?.books.find((b) => b.name === book)?.chapters.find((c) => c.number === chapter);
}

export function hasCommentaryForVerse(book: string, chapter: number, verse: number): boolean {
  const ch = getCommentaryChapter(book, chapter);
  return !!ch?.entries.some((e) => verse >= e.verseStart && verse <= e.verseEnd);
}
