export type OffertoryReference = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
};

export const OFFERTORY_REFERENCES: OffertoryReference[] = [
  { book: 'Leviticus', chapter: 22, verseStart: 29 },
  { book: 'Deuteronomy', chapter: 16, verseStart: 17 },
  { book: 'Psalms', chapter: 24, verseStart: 1 },
  { book: 'Psalms', chapter: 96, verseStart: 7 },
  { book: 'Proverbs', chapter: 29, verseStart: 18 },
  { book: 'Proverbs', chapter: 3, verseStart: 9, verseEnd: 10 },
  { book: 'Haggai', chapter: 2, verseStart: 8 },
  { book: 'Malachi', chapter: 3, verseStart: 10 },
  { book: 'Matthew', chapter: 6, verseStart: 20, verseEnd: 21 },
  { book: 'Luke', chapter: 21, verseStart: 3, verseEnd: 4 },
  { book: 'John', chapter: 3, verseStart: 16 },
  { book: '2 Corinthians', chapter: 9, verseStart: 7 },
  { book: '2 Corinthians', chapter: 8, verseStart: 12 },
  { book: 'Ephesians', chapter: 2, verseStart: 10 },
  { book: 'James', chapter: 1, verseStart: 17 },
  { book: 'Psalms', chapter: 116, verseStart: 12 },
];

export function formatOffertoryRef(ref: OffertoryReference): string {
  return ref.verseEnd ? `${ref.book} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}` : `${ref.book} ${ref.chapter}:${ref.verseStart}`;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

export function getOffertoryReferenceOfDay(date: Date = new Date()): OffertoryReference {
  return OFFERTORY_REFERENCES[dayOfYear(date) % OFFERTORY_REFERENCES.length];
}
