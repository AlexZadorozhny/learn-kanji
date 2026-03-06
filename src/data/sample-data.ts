import { KanjiCharacter } from '../types/kanji';

export const sampleKanjiData: KanjiCharacter[] = [
  {
    id: 'U+4E00',
    character: '一',
    frequencyRank: 1,
    meanings: ['one'],
    onYomi: [
      { reading: 'イチ', romaji: 'ichi' },
      { reading: 'イツ', romaji: 'itsu' },
    ],
    kunYomi: [
      { reading: 'ひと', romaji: 'hito' },
      { reading: 'ひとつ', romaji: 'hitotsu' },
    ],
    strokes: 1,
    radicals: ['一'],
    exampleWords: [
      {
        word: '一つ',
        reading: 'ひとつ',
        romaji: 'hitotsu',
        meaning: 'one (thing)',
      },
      {
        word: '一人',
        reading: 'ひとり',
        romaji: 'hitori',
        meaning: 'one person; alone',
      },
      {
        word: '一日',
        reading: 'ついたち',
        romaji: 'tsuitachi',
        meaning: 'first day of the month',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4E8C',
    character: '二',
    frequencyRank: 2,
    meanings: ['two'],
    onYomi: [
      { reading: 'ニ', romaji: 'ni' },
    ],
    kunYomi: [
      { reading: 'ふた', romaji: 'futa' },
      { reading: 'ふたつ', romaji: 'futatsu' },
    ],
    strokes: 2,
    radicals: ['二'],
    exampleWords: [
      {
        word: '二つ',
        reading: 'ふたつ',
        romaji: 'futatsu',
        meaning: 'two (things)',
      },
      {
        word: '二人',
        reading: 'ふたり',
        romaji: 'futari',
        meaning: 'two people',
      },
      {
        word: '二月',
        reading: 'にがつ',
        romaji: 'nigatsu',
        meaning: 'February',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4E09',
    character: '三',
    frequencyRank: 3,
    meanings: ['three'],
    onYomi: [
      { reading: 'サン', romaji: 'san' },
    ],
    kunYomi: [
      { reading: 'み', romaji: 'mi' },
      { reading: 'みつ', romaji: 'mitsu' },
      { reading: 'みっつ', romaji: 'mittsu' },
    ],
    strokes: 3,
    radicals: ['一'],
    exampleWords: [
      {
        word: '三つ',
        reading: 'みっつ',
        romaji: 'mittsu',
        meaning: 'three (things)',
      },
      {
        word: '三人',
        reading: 'さんにん',
        romaji: 'sannin',
        meaning: 'three people',
      },
      {
        word: '三月',
        reading: 'さんがつ',
        romaji: 'sangatsu',
        meaning: 'March',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4EBA',
    character: '人',
    frequencyRank: 4,
    meanings: ['person', 'people'],
    onYomi: [
      { reading: 'ジン', romaji: 'jin' },
      { reading: 'ニン', romaji: 'nin' },
    ],
    kunYomi: [
      { reading: 'ひと', romaji: 'hito' },
    ],
    strokes: 2,
    radicals: ['人'],
    exampleWords: [
      {
        word: '人',
        reading: 'ひと',
        romaji: 'hito',
        meaning: 'person',
      },
      {
        word: '日本人',
        reading: 'にほんじん',
        romaji: 'nihonjin',
        meaning: 'Japanese person',
      },
      {
        word: '外国人',
        reading: 'がいこくじん',
        romaji: 'gaikokujin',
        meaning: 'foreigner',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+65E5',
    character: '日',
    frequencyRank: 5,
    meanings: ['day', 'sun', 'Japan'],
    onYomi: [
      { reading: 'ニチ', romaji: 'nichi' },
      { reading: 'ジツ', romaji: 'jitsu' },
    ],
    kunYomi: [
      { reading: 'ひ', romaji: 'hi' },
      { reading: 'か', romaji: 'ka' },
    ],
    strokes: 4,
    radicals: ['日'],
    exampleWords: [
      {
        word: '今日',
        reading: 'きょう',
        romaji: 'kyou',
        meaning: 'today',
      },
      {
        word: '日本',
        reading: 'にほん',
        romaji: 'nihon',
        meaning: 'Japan',
      },
      {
        word: '毎日',
        reading: 'まいにち',
        romaji: 'mainichi',
        meaning: 'every day',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
];
