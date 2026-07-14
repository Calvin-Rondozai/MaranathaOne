export type CrossRef = { book: string; chapter: number; verse: number };

// Source: openbible.info cross-reference dataset (CC BY), top 5 by vote count per verse.
// Lazily required (not a top-level import) so its ~2.7MB isn't parsed into memory unless
// a verse with cross-references is actually rendered.
let DATA: Record<string, [string, number, number][]> | null = null;

function load(): Record<string, [string, number, number][]> {
  if (!DATA) DATA = require('./crossReferences.json');
  return DATA!;
}

export function getCrossReferences(book: string, chapter: number, verse: number): CrossRef[] {
  const key = `${book}|${chapter}|${verse}`;
  const refs = load()[key];
  if (!refs) return [];
  return refs.map(([b, c, v]) => ({ book: b, chapter: c, verse: v }));
}
