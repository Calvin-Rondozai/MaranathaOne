import type { SQLiteDatabase } from 'expo-sqlite';
import { loadJsonAsset } from './loadJsonAsset';

type VerseTuple = [book: string, chapter: number, verse: number, text: string];

const INSERT_BATCH_SIZE = 400;

// Each translation is ~4.5MB. Loaded as a .datjson asset (see metro.config.js) rather than a
// plain require() so its content lives in the APK as its own compressed file instead of being
// baked into the JS bundle — and only actually read on the rare occasion this migration runs.
const TRANSLATION_MODULES: Record<string, number> = {
  NHEB: require('./bibleFull.NHEB.datjson'),
  KJV: require('./bibleFull.KJV.datjson'),
  ASV: require('./bibleFull.ASV.datjson'),
  MKJV: require('./bibleFull.MKJV.datjson'),
  SNA: require('./bibleFull.SNA.datjson'),
};

export async function loadFullBible(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM bible');
    for (const [translation, moduleId] of Object.entries(TRANSLATION_MODULES)) {
      const verses = await loadJsonAsset<VerseTuple[]>(moduleId);
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
