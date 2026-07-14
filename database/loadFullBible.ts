import type { SQLiteDatabase } from 'expo-sqlite';

type VerseTuple = [book: string, chapter: number, verse: number, text: string];

const INSERT_BATCH_SIZE = 400;

export async function loadFullBible(db: SQLiteDatabase): Promise<void> {
  // Each translation is ~4.5MB of JSON. Requiring these inside the function (rather
  // than as top-level imports) keeps them out of memory on every app launch — they're
  // only actually parsed on the rare occasion this migration step runs.
  const TRANSLATION_DATA: Record<string, VerseTuple[]> = {
    NHEB: require('./bibleFull.NHEB.json'),
    KJV: require('./bibleFull.KJV.json'),
    ASV: require('./bibleFull.ASV.json'),
    MKJV: require('./bibleFull.MKJV.json'),
    SNA: require('./bibleFull.SNA.json'),
  };

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM bible');
    for (const [translation, verses] of Object.entries(TRANSLATION_DATA)) {
      for (let i = 0; i < verses.length; i += INSERT_BATCH_SIZE) {
        const chunk = verses.slice(i, i + INSERT_BATCH_SIZE);
        const placeholders = chunk.map(() => '(?,?,?,?,?)').join(',');
        const params = chunk.flatMap((v) => [translation, ...v]);
        await db.runAsync(
          `INSERT INTO bible (translation, book, chapter, verse, text) VALUES ${placeholders}`,
          params
        );
      }
    }
  });
}
