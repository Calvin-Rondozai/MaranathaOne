import shonaBookNames from './shonaBookNames.json';

const BOOK_NAME_OVERRIDES: Record<string, Record<string, string>> = {
  SNA: shonaBookNames,
};

export function getLocalizedBookName(translation: string, englishName: string): string {
  return BOOK_NAME_OVERRIDES[translation]?.[englishName] ?? englishName;
}
