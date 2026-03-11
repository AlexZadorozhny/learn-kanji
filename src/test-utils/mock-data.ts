import { KanjiCharacter } from '../types/kanji';

/**
 * Mock kanji data for testing - provides predictable, minimal test data
 */
export const mockKanjiOne: KanjiCharacter = {
  id: 'U+4E00',
  character: '一',
  frequencyRank: 1,
  meanings: ['one', 'single'],
  onYomi: [
    { reading: 'イチ', romaji: 'ichi' },
    { reading: 'イツ', romaji: 'itsu' },
  ],
  kunYomi: [{ reading: 'ひと', romaji: 'hito' }],
  strokes: 1,
  radicals: ['一'],
  exampleWords: [
    {
      word: '一人',
      reading: 'ひとり',
      romaji: 'hitori',
      meaning: 'one person; alone',
    },
    {
      word: '一つ',
      reading: 'ひとつ',
      romaji: 'hitotsu',
      meaning: 'one (thing)',
    },
  ],
  jlptLevel: 5,
  gradeLevel: 1,
};

export const mockKanjiTwo: KanjiCharacter = {
  id: 'U+4E8C',
  character: '二',
  frequencyRank: 2,
  meanings: ['two'],
  onYomi: [{ reading: 'ニ', romaji: 'ni' }],
  kunYomi: [{ reading: 'ふた', romaji: 'futa' }],
  strokes: 2,
  radicals: ['二'],
  exampleWords: [
    {
      word: '二人',
      reading: 'ふたり',
      romaji: 'futari',
      meaning: 'two people',
    },
  ],
  jlptLevel: 5,
  gradeLevel: 1,
};

export const mockKanjiList = [mockKanjiOne, mockKanjiTwo];
