import { loadJsonAsset } from './loadJsonAsset';

export type EgwChapter = { number: number; title: string; content: string };
export type EgwBook = { code: string; title: string; author: string; chapters: EgwChapter[] };

export const EGW_BOOK_LIST: { code: string; title: string }[] = [
  { code: 'sc', title: 'Steps to Christ' },
  { code: 'pp', title: 'Patriarchs and Prophets' },
  { code: 'pk', title: 'Prophets and Kings' },
  { code: 'da', title: 'The Desire of Ages' },
  { code: 'aa', title: 'The Acts of the Apostles' },
  { code: 'gc', title: 'The Great Controversy' },
  { code: 'col', title: "Christ's Object Lessons" },
  { code: 'mb', title: 'Thoughts From the Mount of Blessing' },
  { code: 'mh', title: 'The Ministry of Healing' },
  { code: 'ed', title: 'Education' },
  { code: 'ew', title: 'Early Writings' },
  { code: 'sl', title: 'The Sanctified Life' },
  { code: 'slp', title: 'Sketches From the Life of Paul' },
  { code: 'ls', title: 'Life Sketches of Ellen G. White' },
  { code: 't1', title: 'Testimonies for the Church, vol. 1' },
  { code: 't2', title: 'Testimonies for the Church, vol. 2' },
  { code: 't3', title: 'Testimonies for the Church, vol. 3' },
  { code: 't4', title: 'Testimonies for the Church, vol. 4' },
  { code: 't5', title: 'Testimonies for the Church, vol. 5' },
  { code: 't6', title: 'Testimonies for the Church, vol. 6' },
  { code: 't7', title: 'Testimonies for the Church, vol. 7' },
  { code: 't8', title: 'Testimonies for the Church, vol. 8' },
  { code: 't9', title: 'Testimonies for the Church, vol. 9' },
  { code: 'adventhome', title: 'The Adventist Home' },
  { code: 'cet', title: 'Christian Experience and Teachings of Ellen G. White' },
  { code: 'cthbh', title: 'Christian Temperance and Bible Hygiene' },
  { code: 'darkness', title: 'Darkness Before Dawn' },
  { code: 'diet', title: 'Counsels on Diet and Foods' },
  { code: 'heavenlove', title: 'From Heaven With Love' },
  { code: 'lsjw', title: 'Life Sketches of James White and Ellen G. White (1888)' },
  { code: 'mcp1', title: 'Mind, Character, and Personality, vol. 1' },
  { code: 'mcp2', title: 'Mind, Character, and Personality, vol. 2' },
  { code: 'mtyp', title: 'Messages to Young People' },
  { code: 'prayer', title: 'Prayer' },
  { code: 'sg1', title: 'Spiritual Gifts, Volume 1' },
  { code: 'sg2', title: 'Spiritual Gifts, Volume 2' },
  { code: 'sg3', title: 'Spiritual Gifts, Volume 3' },
  { code: 'sg4', title: 'Spiritual Gifts, Volume 4A' },
  { code: 'sm3', title: 'Selected Messages, Book 3' },
  { code: 'solemnappeal', title: 'A Solemn Appeal' },
  { code: 'ste', title: 'Special Testimonies on Education' },
  { code: 'temperance', title: 'Temperance' },
  { code: 'truerevival', title: "True Revival: The Church's Greatest Need" },
  { code: 'tsbad', title: 'Testimonies on Sexual Behavior, Adultery, and Divorce' },
  { code: 'tssw', title: 'Testimonies on Sabbath-School Work' },
  { code: 'voicesong', title: 'The Voice in Speech and Song' },
  { code: 'cptns', title: 'Counsels to Parents, Teachers, and Students' },
  { code: 'evangelism', title: 'Evangelism' },
  { code: 'sdabc7a', title: 'S.D.A. Bible Commentary, vol. 7A (Appendix)' },
];

// Each book is its own .datjson file (some are large), loaded on demand so opening the app
// doesn't parse every EGW book into memory — only the one the user actually opens. See
// metro.config.js/loadJsonAsset.ts for why these aren't plain JSON requires.
const BOOK_MODULES: Record<string, number> = {
  sc: require('./egwSc.datjson'),
  pp: require('./egwPp.datjson'),
  pk: require('./egwPk.datjson'),
  da: require('./egwDa.datjson'),
  aa: require('./egwAa.datjson'),
  gc: require('./egwGc.datjson'),
  col: require('./egwCol.datjson'),
  mb: require('./egwMb.datjson'),
  mh: require('./egwMh.datjson'),
  ed: require('./egwEd.datjson'),
  ew: require('./egwEw.datjson'),
  sl: require('./egwSl.datjson'),
  slp: require('./egwSlp.datjson'),
  ls: require('./egwLs.datjson'),
  t1: require('./egwT1.datjson'),
  t2: require('./egwT2.datjson'),
  t3: require('./egwT3.datjson'),
  t4: require('./egwT4.datjson'),
  t5: require('./egwT5.datjson'),
  t6: require('./egwT6.datjson'),
  t7: require('./egwT7.datjson'),
  t8: require('./egwT8.datjson'),
  t9: require('./egwT9.datjson'),
  adventhome: require('./egwAdventHome.datjson'),
  cet: require('./egwCet.datjson'),
  cthbh: require('./egwCthbh.datjson'),
  darkness: require('./egwDarkness.datjson'),
  diet: require('./egwDiet.datjson'),
  heavenlove: require('./egwHeavenLove.datjson'),
  lsjw: require('./egwLsjw.datjson'),
  mcp1: require('./egwMcp1.datjson'),
  mcp2: require('./egwMcp2.datjson'),
  mtyp: require('./egwMtyp.datjson'),
  prayer: require('./egwPrayer.datjson'),
  sg1: require('./egwSg1.datjson'),
  sg2: require('./egwSg2.datjson'),
  sg3: require('./egwSg3.datjson'),
  sg4: require('./egwSg4.datjson'),
  sm3: require('./egwSm3.datjson'),
  solemnappeal: require('./egwSolemnAppeal.datjson'),
  ste: require('./egwSte.datjson'),
  temperance: require('./egwTemperance.datjson'),
  truerevival: require('./egwTrueRevival.datjson'),
  tsbad: require('./egwTsbad.datjson'),
  tssw: require('./egwTssw.datjson'),
  voicesong: require('./egwVoiceSong.datjson'),
  cptns: require('./egwCptns.datjson'),
  evangelism: require('./egwEvangelism.datjson'),
  sdabc7a: require('./egwSdabc7a.datjson'),
};

const BOOK_DATA: Partial<Record<string, EgwBook>> = {};

async function loadBook(code: string): Promise<EgwBook | undefined> {
  if (!BOOK_DATA[code]) {
    const moduleId = BOOK_MODULES[code];
    if (moduleId === undefined) return undefined;
    BOOK_DATA[code] = await loadJsonAsset<EgwBook>(moduleId);
  }
  return BOOK_DATA[code];
}

export function getEgwBook(code: string): Promise<EgwBook | undefined> {
  return loadBook(code);
}

export async function getEgwChapter(code: string, number: number): Promise<EgwChapter | undefined> {
  const book = await loadBook(code);
  return book?.chapters.find((c) => c.number === number);
}

// The AI search index builder (database/searchIndex.ts) walks every book once to index
// it — unlike normal reading, which only ever touches one book at a time — so it clears
// the cache behind it afterward rather than leaving all ~48 books resident in memory.
export function clearEgwCache(): void {
  for (const key of Object.keys(BOOK_DATA)) delete BOOK_DATA[key];
}
