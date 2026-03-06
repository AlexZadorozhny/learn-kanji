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
    strokeOrder: [
      {
        path: 'M 10 50 L 90 50',
        strokeNumber: 1,
      },
    ],
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
    strokeOrder: [
      {
        path: 'M 10 35 L 90 35',
        strokeNumber: 1,
      },
      {
        path: 'M 10 65 L 90 65',
        strokeNumber: 2,
      },
    ],
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
    strokeOrder: [
      {
        path: 'M 10 25 L 90 25',
        strokeNumber: 1,
      },
      {
        path: 'M 10 50 L 90 50',
        strokeNumber: 2,
      },
      {
        path: 'M 10 75 L 90 75',
        strokeNumber: 3,
      },
    ],
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
    strokeOrder: [
      {
        path: 'M 30 20 L 45 80',
        strokeNumber: 1,
      },
      {
        path: 'M 70 20 L 55 80',
        strokeNumber: 2,
      },
    ],
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
    strokeOrder: [
      {
        path: 'M 25 20 L 75 20',
        strokeNumber: 1,
      },
      {
        path: 'M 25 20 L 25 80',
        strokeNumber: 2,
      },
      {
        path: 'M 25 50 L 75 50',
        strokeNumber: 3,
      },
      {
        path: 'M 75 20 L 75 80 M 75 80 L 25 80',
        strokeNumber: 4,
      },
    ],
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
  {
    id: 'U+56FD',
    character: '国',
    frequencyRank: 6,
    meanings: ['country', 'nation'],
    onYomi: [
      { reading: 'コク', romaji: 'koku' },
    ],
    kunYomi: [
      { reading: 'くに', romaji: 'kuni' },
    ],
    strokes: 8,
    strokeOrder: [
      {
        path: 'M 20 20 L 80 20 L 80 80 L 20 80 L 20 20',
        strokeNumber: 1,
      },
      {
        path: 'M 35 35 L 35 50',
        strokeNumber: 2,
      },
      {
        path: 'M 35 50 L 50 50',
        strokeNumber: 3,
      },
      {
        path: 'M 50 50 L 50 35',
        strokeNumber: 4,
      },
      {
        path: 'M 50 35 L 65 35',
        strokeNumber: 5,
      },
      {
        path: 'M 65 35 L 65 65',
        strokeNumber: 6,
      },
      {
        path: 'M 35 65 L 65 65',
        strokeNumber: 7,
      },
      {
        path: 'M 40 55 L 60 70',
        strokeNumber: 8,
      },
    ],
    radicals: ['囗', '玉'],
    exampleWords: [
      {
        word: '国',
        reading: 'くに',
        romaji: 'kuni',
        meaning: 'country',
      },
      {
        word: '外国',
        reading: 'がいこく',
        romaji: 'gaikoku',
        meaning: 'foreign country',
      },
      {
        word: '中国',
        reading: 'ちゅうごく',
        romaji: 'chuugoku',
        meaning: 'China',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+672C',
    character: '本',
    frequencyRank: 7,
    meanings: ['book', 'origin', 'main'],
    onYomi: [
      { reading: 'ホン', romaji: 'hon' },
    ],
    kunYomi: [
      { reading: 'もと', romaji: 'moto' },
    ],
    strokes: 5,
    strokeOrder: [
      {
        path: 'M 50 20 L 50 70',
        strokeNumber: 1,
      },
      {
        path: 'M 20 40 L 80 40',
        strokeNumber: 2,
      },
      {
        path: 'M 30 55 L 45 75',
        strokeNumber: 3,
      },
      {
        path: 'M 55 55 L 70 75',
        strokeNumber: 4,
      },
      {
        path: 'M 40 75 L 60 75',
        strokeNumber: 5,
      },
    ],
    radicals: ['木'],
    exampleWords: [
      {
        word: '本',
        reading: 'ほん',
        romaji: 'hon',
        meaning: 'book',
      },
      {
        word: '日本',
        reading: 'にほん',
        romaji: 'nihon',
        meaning: 'Japan',
      },
      {
        word: '本当',
        reading: 'ほんとう',
        romaji: 'hontou',
        meaning: 'truth; really',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+5927',
    character: '大',
    frequencyRank: 8,
    meanings: ['big', 'large', 'great'],
    onYomi: [
      { reading: 'ダイ', romaji: 'dai' },
      { reading: 'タイ', romaji: 'tai' },
    ],
    kunYomi: [
      { reading: 'おお', romaji: 'oo' },
      { reading: 'おおきい', romaji: 'ookii' },
    ],
    strokes: 3,
    strokeOrder: [
      {
        path: 'M 50 20 L 50 75',
        strokeNumber: 1,
      },
      {
        path: 'M 20 35 L 80 65',
        strokeNumber: 2,
      },
      {
        path: 'M 80 35 L 20 65',
        strokeNumber: 3,
      },
    ],
    radicals: ['大'],
    exampleWords: [
      {
        word: '大きい',
        reading: 'おおきい',
        romaji: 'ookii',
        meaning: 'big',
      },
      {
        word: '大学',
        reading: 'だいがく',
        romaji: 'daigaku',
        meaning: 'university',
      },
      {
        word: '大好き',
        reading: 'だいすき',
        romaji: 'daisuki',
        meaning: 'love; like very much',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+5E74',
    character: '年',
    frequencyRank: 9,
    meanings: ['year', 'age'],
    onYomi: [
      { reading: 'ネン', romaji: 'nen' },
    ],
    kunYomi: [
      { reading: 'とし', romaji: 'toshi' },
    ],
    strokes: 6,
    strokeOrder: [
      {
        path: 'M 30 30 L 50 25',
        strokeNumber: 1,
      },
      {
        path: 'M 50 25 L 70 30',
        strokeNumber: 2,
      },
      {
        path: 'M 50 25 L 50 75',
        strokeNumber: 3,
      },
      {
        path: 'M 20 50 L 80 50',
        strokeNumber: 4,
      },
      {
        path: 'M 25 65 L 45 80',
        strokeNumber: 5,
      },
      {
        path: 'M 55 65 L 75 80',
        strokeNumber: 6,
      },
    ],
    radicals: ['干'],
    exampleWords: [
      {
        word: '今年',
        reading: 'ことし',
        romaji: 'kotoshi',
        meaning: 'this year',
      },
      {
        word: '来年',
        reading: 'らいねん',
        romaji: 'rainen',
        meaning: 'next year',
      },
      {
        word: '去年',
        reading: 'きょねん',
        romaji: 'kyonen',
        meaning: 'last year',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4E2D',
    character: '中',
    frequencyRank: 10,
    meanings: ['middle', 'inside', 'center'],
    onYomi: [
      { reading: 'チュウ', romaji: 'chuu' },
    ],
    kunYomi: [
      { reading: 'なか', romaji: 'naka' },
    ],
    strokes: 4,
    strokeOrder: [
      {
        path: 'M 50 20 L 50 80',
        strokeNumber: 1,
      },
      {
        path: 'M 25 30 L 75 30',
        strokeNumber: 2,
      },
      {
        path: 'M 25 30 L 25 70 L 75 70 L 75 30',
        strokeNumber: 3,
      },
      {
        path: 'M 50 50 L 50 50',
        strokeNumber: 4,
      },
    ],
    radicals: ['丨'],
    exampleWords: [
      {
        word: '中',
        reading: 'なか',
        romaji: 'naka',
        meaning: 'inside',
      },
      {
        word: '中国',
        reading: 'ちゅうごく',
        romaji: 'chuugoku',
        meaning: 'China',
      },
      {
        word: '一年中',
        reading: 'いちねんじゅう',
        romaji: 'ichinenjuu',
        meaning: 'all year round',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+51FA',
    character: '出',
    frequencyRank: 11,
    meanings: ['exit', 'leave', 'come out'],
    onYomi: [
      { reading: 'シュツ', romaji: 'shutsu' },
    ],
    kunYomi: [
      { reading: 'でる', romaji: 'deru' },
      { reading: 'だす', romaji: 'dasu' },
    ],
    strokes: 5,
    strokeOrder: [
      {
        path: 'M 50 20 L 50 45',
        strokeNumber: 1,
      },
      {
        path: 'M 30 35 L 30 55',
        strokeNumber: 2,
      },
      {
        path: 'M 70 35 L 70 55',
        strokeNumber: 3,
      },
      {
        path: 'M 30 55 L 70 55',
        strokeNumber: 4,
      },
      {
        path: 'M 50 55 L 50 80',
        strokeNumber: 5,
      },
    ],
    radicals: ['凵'],
    exampleWords: [
      {
        word: '出る',
        reading: 'でる',
        romaji: 'deru',
        meaning: 'to leave; to go out',
      },
      {
        word: '出口',
        reading: 'でぐち',
        romaji: 'deguchi',
        meaning: 'exit',
      },
      {
        word: '出発',
        reading: 'しゅっぱつ',
        romaji: 'shuppatsu',
        meaning: 'departure',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4E0A',
    character: '上',
    frequencyRank: 12,
    meanings: ['up', 'above', 'top'],
    onYomi: [
      { reading: 'ジョウ', romaji: 'jou' },
    ],
    kunYomi: [
      { reading: 'うえ', romaji: 'ue' },
      { reading: 'あがる', romaji: 'agaru' },
    ],
    strokes: 3,
    strokeOrder: [
      {
        path: 'M 50 30 L 50 60',
        strokeNumber: 1,
      },
      {
        path: 'M 30 45 L 70 45',
        strokeNumber: 2,
      },
      {
        path: 'M 20 70 L 80 70',
        strokeNumber: 3,
      },
    ],
    radicals: ['一'],
    exampleWords: [
      {
        word: '上',
        reading: 'うえ',
        romaji: 'ue',
        meaning: 'up; above',
      },
      {
        word: '上手',
        reading: 'じょうず',
        romaji: 'jouzu',
        meaning: 'skillful; good at',
      },
      {
        word: '以上',
        reading: 'いじょう',
        romaji: 'ijou',
        meaning: 'more than; above',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+751F',
    character: '生',
    frequencyRank: 13,
    meanings: ['life', 'birth', 'raw'],
    onYomi: [
      { reading: 'セイ', romaji: 'sei' },
      { reading: 'ショウ', romaji: 'shou' },
    ],
    kunYomi: [
      { reading: 'いきる', romaji: 'ikiru' },
      { reading: 'うまれる', romaji: 'umareru' },
      { reading: 'なま', romaji: 'nama' },
    ],
    strokes: 5,
    strokeOrder: [
      {
        path: 'M 30 30 L 50 25',
        strokeNumber: 1,
      },
      {
        path: 'M 50 25 L 70 30',
        strokeNumber: 2,
      },
      {
        path: 'M 50 25 L 50 75',
        strokeNumber: 3,
      },
      {
        path: 'M 20 50 L 80 50',
        strokeNumber: 4,
      },
      {
        path: 'M 30 65 L 70 65',
        strokeNumber: 5,
      },
    ],
    radicals: ['生'],
    exampleWords: [
      {
        word: '学生',
        reading: 'がくせい',
        romaji: 'gakusei',
        meaning: 'student',
      },
      {
        word: '先生',
        reading: 'せんせい',
        romaji: 'sensei',
        meaning: 'teacher',
      },
      {
        word: '生活',
        reading: 'せいかつ',
        romaji: 'seikatsu',
        meaning: 'life; living',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+6642',
    character: '時',
    frequencyRank: 14,
    meanings: ['time', 'hour'],
    onYomi: [
      { reading: 'ジ', romaji: 'ji' },
    ],
    kunYomi: [
      { reading: 'とき', romaji: 'toki' },
    ],
    strokes: 10,
    strokeOrder: [
      {
        path: 'M 20 20 L 35 20',
        strokeNumber: 1,
      },
      {
        path: 'M 20 20 L 20 70',
        strokeNumber: 2,
      },
      {
        path: 'M 20 45 L 35 45',
        strokeNumber: 3,
      },
      {
        path: 'M 35 20 L 35 70 M 35 70 L 20 70',
        strokeNumber: 4,
      },
      {
        path: 'M 50 25 L 80 25',
        strokeNumber: 5,
      },
      {
        path: 'M 65 25 L 65 75',
        strokeNumber: 6,
      },
      {
        path: 'M 50 45 L 80 45',
        strokeNumber: 7,
      },
      {
        path: 'M 45 60 L 85 60',
        strokeNumber: 8,
      },
      {
        path: 'M 50 70 L 60 80',
        strokeNumber: 9,
      },
      {
        path: 'M 70 70 L 80 80',
        strokeNumber: 10,
      },
    ],
    radicals: ['日', '寺'],
    exampleWords: [
      {
        word: '時間',
        reading: 'じかん',
        romaji: 'jikan',
        meaning: 'time',
      },
      {
        word: '何時',
        reading: 'なんじ',
        romaji: 'nanji',
        meaning: 'what time',
      },
      {
        word: '時々',
        reading: 'ときどき',
        romaji: 'tokidoki',
        meaning: 'sometimes',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+624B',
    character: '手',
    frequencyRank: 15,
    meanings: ['hand'],
    onYomi: [
      { reading: 'シュ', romaji: 'shu' },
    ],
    kunYomi: [
      { reading: 'て', romaji: 'te' },
    ],
    strokes: 4,
    strokeOrder: [
      {
        path: 'M 30 30 L 70 30',
        strokeNumber: 1,
      },
      {
        path: 'M 50 30 L 50 60',
        strokeNumber: 2,
      },
      {
        path: 'M 25 50 L 75 50',
        strokeNumber: 3,
      },
      {
        path: 'M 30 65 L 70 65',
        strokeNumber: 4,
      },
    ],
    radicals: ['手'],
    exampleWords: [
      {
        word: '手',
        reading: 'て',
        romaji: 'te',
        meaning: 'hand',
      },
      {
        word: '上手',
        reading: 'じょうず',
        romaji: 'jouzu',
        meaning: 'skillful',
      },
      {
        word: '手紙',
        reading: 'てがみ',
        romaji: 'tegami',
        meaning: 'letter',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+884C',
    character: '行',
    frequencyRank: 16,
    meanings: ['go', 'conduct', 'line'],
    onYomi: [
      { reading: 'コウ', romaji: 'kou' },
      { reading: 'ギョウ', romaji: 'gyou' },
    ],
    kunYomi: [
      { reading: 'いく', romaji: 'iku' },
      { reading: 'ゆく', romaji: 'yuku' },
    ],
    strokes: 6,
    strokeOrder: [
      {
        path: 'M 30 25 L 30 75',
        strokeNumber: 1,
      },
      {
        path: 'M 30 40 L 50 40',
        strokeNumber: 2,
      },
      {
        path: 'M 50 25 L 50 75',
        strokeNumber: 3,
      },
      {
        path: 'M 70 25 L 70 75',
        strokeNumber: 4,
      },
      {
        path: 'M 50 40 L 70 40',
        strokeNumber: 5,
      },
      {
        path: 'M 50 60 L 70 60',
        strokeNumber: 6,
      },
    ],
    radicals: ['行'],
    exampleWords: [
      {
        word: '行く',
        reading: 'いく',
        romaji: 'iku',
        meaning: 'to go',
      },
      {
        word: '銀行',
        reading: 'ぎんこう',
        romaji: 'ginkou',
        meaning: 'bank',
      },
      {
        word: '旅行',
        reading: 'りょこう',
        romaji: 'ryokou',
        meaning: 'travel; trip',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+524D',
    character: '前',
    frequencyRank: 17,
    meanings: ['front', 'before', 'previous'],
    onYomi: [
      { reading: 'ゼン', romaji: 'zen' },
    ],
    kunYomi: [
      { reading: 'まえ', romaji: 'mae' },
    ],
    strokes: 9,
    strokeOrder: [
      {
        path: 'M 30 20 L 70 20',
        strokeNumber: 1,
      },
      {
        path: 'M 50 20 L 50 35',
        strokeNumber: 2,
      },
      {
        path: 'M 35 35 L 65 35',
        strokeNumber: 3,
      },
      {
        path: 'M 25 50 L 40 50',
        strokeNumber: 4,
      },
      {
        path: 'M 25 50 L 25 75',
        strokeNumber: 5,
      },
      {
        path: 'M 25 65 L 40 65',
        strokeNumber: 6,
      },
      {
        path: 'M 40 50 L 40 75 M 40 75 L 25 75',
        strokeNumber: 7,
      },
      {
        path: 'M 55 50 L 70 60',
        strokeNumber: 8,
      },
      {
        path: 'M 70 60 L 75 80',
        strokeNumber: 9,
      },
    ],
    radicals: ['刀', '月'],
    exampleWords: [
      {
        word: '前',
        reading: 'まえ',
        romaji: 'mae',
        meaning: 'front; before',
      },
      {
        word: '午前',
        reading: 'ごぜん',
        romaji: 'gozen',
        meaning: 'morning; AM',
      },
      {
        word: '名前',
        reading: 'なまえ',
        romaji: 'namae',
        meaning: 'name',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+5F8C',
    character: '後',
    frequencyRank: 18,
    meanings: ['after', 'behind', 'back'],
    onYomi: [
      { reading: 'ゴ', romaji: 'go' },
      { reading: 'コウ', romaji: 'kou' },
    ],
    kunYomi: [
      { reading: 'あと', romaji: 'ato' },
      { reading: 'うしろ', romaji: 'ushiro' },
    ],
    strokes: 9,
    strokeOrder: [
      {
        path: 'M 20 30 L 20 60',
        strokeNumber: 1,
      },
      {
        path: 'M 20 30 L 25 25',
        strokeNumber: 2,
      },
      {
        path: 'M 20 45 L 25 45',
        strokeNumber: 3,
      },
      {
        path: 'M 45 25 L 45 50',
        strokeNumber: 4,
      },
      {
        path: 'M 35 35 L 55 35',
        strokeNumber: 5,
      },
      {
        path: 'M 65 25 L 65 50',
        strokeNumber: 6,
      },
      {
        path: 'M 55 35 L 75 35',
        strokeNumber: 7,
      },
      {
        path: 'M 30 60 L 70 60',
        strokeNumber: 8,
      },
      {
        path: 'M 50 60 L 50 80',
        strokeNumber: 9,
      },
    ],
    radicals: ['彳', '幺'],
    exampleWords: [
      {
        word: '後',
        reading: 'あと',
        romaji: 'ato',
        meaning: 'after; later',
      },
      {
        word: '午後',
        reading: 'ごご',
        romaji: 'gogo',
        meaning: 'afternoon; PM',
      },
      {
        word: '後ろ',
        reading: 'うしろ',
        romaji: 'ushiro',
        meaning: 'behind; back',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+898B',
    character: '見',
    frequencyRank: 19,
    meanings: ['see', 'look', 'watch'],
    onYomi: [
      { reading: 'ケン', romaji: 'ken' },
    ],
    kunYomi: [
      { reading: 'みる', romaji: 'miru' },
    ],
    strokes: 7,
    strokeOrder: [
      {
        path: 'M 30 25 L 50 25',
        strokeNumber: 1,
      },
      {
        path: 'M 40 25 L 40 45',
        strokeNumber: 2,
      },
      {
        path: 'M 30 45 L 50 45',
        strokeNumber: 3,
      },
      {
        path: 'M 40 45 L 40 80',
        strokeNumber: 4,
      },
      {
        path: 'M 60 30 L 60 75',
        strokeNumber: 5,
      },
      {
        path: 'M 25 65 L 75 65',
        strokeNumber: 6,
      },
      {
        path: 'M 25 80 L 75 80',
        strokeNumber: 7,
      },
    ],
    radicals: ['見'],
    exampleWords: [
      {
        word: '見る',
        reading: 'みる',
        romaji: 'miru',
        meaning: 'to see; to watch',
      },
      {
        word: '見える',
        reading: 'みえる',
        romaji: 'mieru',
        meaning: 'to be visible',
      },
      {
        word: '意見',
        reading: 'いけん',
        romaji: 'iken',
        meaning: 'opinion',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+4E0B',
    character: '下',
    frequencyRank: 20,
    meanings: ['down', 'below', 'under'],
    onYomi: [
      { reading: 'カ', romaji: 'ka' },
      { reading: 'ゲ', romaji: 'ge' },
    ],
    kunYomi: [
      { reading: 'した', romaji: 'shita' },
      { reading: 'さがる', romaji: 'sagaru' },
      { reading: 'くだる', romaji: 'kudaru' },
    ],
    strokes: 3,
    strokeOrder: [
      {
        path: 'M 20 30 L 80 30',
        strokeNumber: 1,
      },
      {
        path: 'M 50 30 L 50 60',
        strokeNumber: 2,
      },
      {
        path: 'M 30 70 L 70 70',
        strokeNumber: 3,
      },
    ],
    radicals: ['一'],
    exampleWords: [
      {
        word: '下',
        reading: 'した',
        romaji: 'shita',
        meaning: 'below; under',
      },
      {
        word: '地下',
        reading: 'ちか',
        romaji: 'chika',
        meaning: 'underground',
      },
      {
        word: '下手',
        reading: 'へた',
        romaji: 'heta',
        meaning: 'unskillful; poor at',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+6708',
    character: '月',
    frequencyRank: 21,
    meanings: ['moon', 'month'],
    onYomi: [
      { reading: 'ゲツ', romaji: 'getsu' },
      { reading: 'ガツ', romaji: 'gatsu' },
    ],
    kunYomi: [
      { reading: 'つき', romaji: 'tsuki' },
    ],
    strokes: 4,
    strokeOrder: [
      {
        path: 'M 30 25 L 30 75',
        strokeNumber: 1,
      },
      {
        path: 'M 30 25 L 70 30',
        strokeNumber: 2,
      },
      {
        path: 'M 30 50 L 70 50',
        strokeNumber: 3,
      },
      {
        path: 'M 30 75 L 70 75',
        strokeNumber: 4,
      },
    ],
    radicals: ['月'],
    exampleWords: [
      {
        word: '月',
        reading: 'つき',
        romaji: 'tsuki',
        meaning: 'moon',
      },
      {
        word: '一月',
        reading: 'いちがつ',
        romaji: 'ichigatsu',
        meaning: 'January',
      },
      {
        word: '月曜日',
        reading: 'げつようび',
        romaji: 'getsuyoubi',
        meaning: 'Monday',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+5B50',
    character: '子',
    frequencyRank: 22,
    meanings: ['child', 'offspring'],
    onYomi: [
      { reading: 'シ', romaji: 'shi' },
      { reading: 'ス', romaji: 'su' },
    ],
    kunYomi: [
      { reading: 'こ', romaji: 'ko' },
    ],
    strokes: 3,
    strokeOrder: [
      {
        path: 'M 40 25 L 60 25',
        strokeNumber: 1,
      },
      {
        path: 'M 50 25 L 50 60',
        strokeNumber: 2,
      },
      {
        path: 'M 30 60 L 50 75 L 70 60',
        strokeNumber: 3,
      },
    ],
    radicals: ['子'],
    exampleWords: [
      {
        word: '子供',
        reading: 'こども',
        romaji: 'kodomo',
        meaning: 'child',
      },
      {
        word: '男の子',
        reading: 'おとこのこ',
        romaji: 'otokonoko',
        meaning: 'boy',
      },
      {
        word: '女の子',
        reading: 'おんなのこ',
        romaji: 'onnanoko',
        meaning: 'girl',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
  {
    id: 'U+5206',
    character: '分',
    frequencyRank: 23,
    meanings: ['minute', 'divide', 'part'],
    onYomi: [
      { reading: 'ブン', romaji: 'bun' },
      { reading: 'フン', romaji: 'fun' },
    ],
    kunYomi: [
      { reading: 'わける', romaji: 'wakeru' },
      { reading: 'わかる', romaji: 'wakaru' },
    ],
    strokes: 4,
    strokeOrder: [
      {
        path: 'M 30 35 L 50 55',
        strokeNumber: 1,
      },
      {
        path: 'M 70 35 L 50 55',
        strokeNumber: 2,
      },
      {
        path: 'M 60 65 L 70 75',
        strokeNumber: 3,
      },
      {
        path: 'M 40 65 L 30 75',
        strokeNumber: 4,
      },
    ],
    radicals: ['八', '刀'],
    exampleWords: [
      {
        word: '分かる',
        reading: 'わかる',
        romaji: 'wakaru',
        meaning: 'to understand',
      },
      {
        word: '三十分',
        reading: 'さんじゅっぷん',
        romaji: 'sanjuppun',
        meaning: 'thirty minutes',
      },
      {
        word: '自分',
        reading: 'じぶん',
        romaji: 'jibun',
        meaning: 'oneself',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+9593',
    character: '間',
    frequencyRank: 24,
    meanings: ['interval', 'between', 'space'],
    onYomi: [
      { reading: 'カン', romaji: 'kan' },
      { reading: 'ケン', romaji: 'ken' },
    ],
    kunYomi: [
      { reading: 'あいだ', romaji: 'aida' },
      { reading: 'ま', romaji: 'ma' },
    ],
    strokes: 12,
    strokeOrder: [
      {
        path: 'M 20 20 L 20 80',
        strokeNumber: 1,
      },
      {
        path: 'M 20 20 L 40 20',
        strokeNumber: 2,
      },
      {
        path: 'M 40 20 L 40 80',
        strokeNumber: 3,
      },
      {
        path: 'M 20 50 L 40 50',
        strokeNumber: 4,
      },
      {
        path: 'M 20 80 L 40 80',
        strokeNumber: 5,
      },
      {
        path: 'M 60 20 L 60 80',
        strokeNumber: 6,
      },
      {
        path: 'M 60 20 L 80 20',
        strokeNumber: 7,
      },
      {
        path: 'M 80 20 L 80 80',
        strokeNumber: 8,
      },
      {
        path: 'M 60 50 L 80 50',
        strokeNumber: 9,
      },
      {
        path: 'M 60 80 L 80 80',
        strokeNumber: 10,
      },
      {
        path: 'M 45 35 L 55 35',
        strokeNumber: 11,
      },
      {
        path: 'M 50 35 L 50 65',
        strokeNumber: 12,
      },
    ],
    radicals: ['門', '日'],
    exampleWords: [
      {
        word: '時間',
        reading: 'じかん',
        romaji: 'jikan',
        meaning: 'time',
      },
      {
        word: '人間',
        reading: 'にんげん',
        romaji: 'ningen',
        meaning: 'human being',
      },
      {
        word: '間',
        reading: 'あいだ',
        romaji: 'aida',
        meaning: 'between; during',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 2,
  },
  {
    id: 'U+5B66',
    character: '学',
    frequencyRank: 25,
    meanings: ['study', 'learn', 'school'],
    onYomi: [
      { reading: 'ガク', romaji: 'gaku' },
    ],
    kunYomi: [
      { reading: 'まなぶ', romaji: 'manabu' },
    ],
    strokes: 8,
    strokeOrder: [
      {
        path: 'M 25 25 L 35 20',
        strokeNumber: 1,
      },
      {
        path: 'M 35 20 L 45 25',
        strokeNumber: 2,
      },
      {
        path: 'M 25 25 L 45 25',
        strokeNumber: 3,
      },
      {
        path: 'M 20 35 L 80 35',
        strokeNumber: 4,
      },
      {
        path: 'M 50 35 L 50 55',
        strokeNumber: 5,
      },
      {
        path: 'M 35 55 L 65 55',
        strokeNumber: 6,
      },
      {
        path: 'M 50 55 L 50 65',
        strokeNumber: 7,
      },
      {
        path: 'M 25 65 L 50 80 L 75 65',
        strokeNumber: 8,
      },
    ],
    radicals: ['子'],
    exampleWords: [
      {
        word: '学校',
        reading: 'がっこう',
        romaji: 'gakkou',
        meaning: 'school',
      },
      {
        word: '大学',
        reading: 'だいがく',
        romaji: 'daigaku',
        meaning: 'university',
      },
      {
        word: '学生',
        reading: 'がくせい',
        romaji: 'gakusei',
        meaning: 'student',
      },
    ],
    jlptLevel: 5,
    gradeLevel: 1,
  },
];
