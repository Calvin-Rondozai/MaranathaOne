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

// Each book is its own JSON file (some are large), lazily required so opening the app
// doesn't parse every EGW book into memory — only the one the user actually opens.
const BOOK_DATA: Partial<Record<string, EgwBook>> = {};

function loadBook(code: string): EgwBook | undefined {
  if (!BOOK_DATA[code]) {
    switch (code) {
      case 'sc': BOOK_DATA.sc = require('./egwSc.json'); break;
      case 'pp': BOOK_DATA.pp = require('./egwPp.json'); break;
      case 'pk': BOOK_DATA.pk = require('./egwPk.json'); break;
      case 'da': BOOK_DATA.da = require('./egwDa.json'); break;
      case 'aa': BOOK_DATA.aa = require('./egwAa.json'); break;
      case 'gc': BOOK_DATA.gc = require('./egwGc.json'); break;
      case 'col': BOOK_DATA.col = require('./egwCol.json'); break;
      case 'mb': BOOK_DATA.mb = require('./egwMb.json'); break;
      case 'mh': BOOK_DATA.mh = require('./egwMh.json'); break;
      case 'ed': BOOK_DATA.ed = require('./egwEd.json'); break;
      case 'ew': BOOK_DATA.ew = require('./egwEw.json'); break;
      case 'sl': BOOK_DATA.sl = require('./egwSl.json'); break;
      case 'slp': BOOK_DATA.slp = require('./egwSlp.json'); break;
      case 'ls': BOOK_DATA.ls = require('./egwLs.json'); break;
      case 't1': BOOK_DATA.t1 = require('./egwT1.json'); break;
      case 't2': BOOK_DATA.t2 = require('./egwT2.json'); break;
      case 't3': BOOK_DATA.t3 = require('./egwT3.json'); break;
      case 't4': BOOK_DATA.t4 = require('./egwT4.json'); break;
      case 't5': BOOK_DATA.t5 = require('./egwT5.json'); break;
      case 't6': BOOK_DATA.t6 = require('./egwT6.json'); break;
      case 't7': BOOK_DATA.t7 = require('./egwT7.json'); break;
      case 't8': BOOK_DATA.t8 = require('./egwT8.json'); break;
      case 't9': BOOK_DATA.t9 = require('./egwT9.json'); break;
      case 'adventhome': BOOK_DATA.adventhome = require('./egwAdventHome.json'); break;
      case 'cet': BOOK_DATA.cet = require('./egwCet.json'); break;
      case 'cthbh': BOOK_DATA.cthbh = require('./egwCthbh.json'); break;
      case 'darkness': BOOK_DATA.darkness = require('./egwDarkness.json'); break;
      case 'diet': BOOK_DATA.diet = require('./egwDiet.json'); break;
      case 'heavenlove': BOOK_DATA.heavenlove = require('./egwHeavenLove.json'); break;
      case 'lsjw': BOOK_DATA.lsjw = require('./egwLsjw.json'); break;
      case 'mcp1': BOOK_DATA.mcp1 = require('./egwMcp1.json'); break;
      case 'mcp2': BOOK_DATA.mcp2 = require('./egwMcp2.json'); break;
      case 'mtyp': BOOK_DATA.mtyp = require('./egwMtyp.json'); break;
      case 'prayer': BOOK_DATA.prayer = require('./egwPrayer.json'); break;
      case 'sg1': BOOK_DATA.sg1 = require('./egwSg1.json'); break;
      case 'sg2': BOOK_DATA.sg2 = require('./egwSg2.json'); break;
      case 'sg3': BOOK_DATA.sg3 = require('./egwSg3.json'); break;
      case 'sg4': BOOK_DATA.sg4 = require('./egwSg4.json'); break;
      case 'sm3': BOOK_DATA.sm3 = require('./egwSm3.json'); break;
      case 'solemnappeal': BOOK_DATA.solemnappeal = require('./egwSolemnAppeal.json'); break;
      case 'ste': BOOK_DATA.ste = require('./egwSte.json'); break;
      case 'temperance': BOOK_DATA.temperance = require('./egwTemperance.json'); break;
      case 'truerevival': BOOK_DATA.truerevival = require('./egwTrueRevival.json'); break;
      case 'tsbad': BOOK_DATA.tsbad = require('./egwTsbad.json'); break;
      case 'tssw': BOOK_DATA.tssw = require('./egwTssw.json'); break;
      case 'voicesong': BOOK_DATA.voicesong = require('./egwVoiceSong.json'); break;
      case 'cptns': BOOK_DATA.cptns = require('./egwCptns.json'); break;
      case 'evangelism': BOOK_DATA.evangelism = require('./egwEvangelism.json'); break;
      case 'sdabc7a': BOOK_DATA.sdabc7a = require('./egwSdabc7a.json'); break;
      default: return undefined;
    }
  }
  return BOOK_DATA[code];
}

export function getEgwBook(code: string): EgwBook | undefined {
  return loadBook(code);
}

export function getEgwChapter(code: string, number: number): EgwChapter | undefined {
  return loadBook(code)?.chapters.find((c) => c.number === number);
}
