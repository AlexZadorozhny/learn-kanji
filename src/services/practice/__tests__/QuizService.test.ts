import { QuizService } from '../QuizService';
import { KanjiCharacter } from '../../../types/kanji';

describe('QuizService', () => {
  const mockKanji: KanjiCharacter[] = [
    {
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
      exampleWords: [],
      jlptLevel: 5,
      gradeLevel: 1,
    },
    {
      id: 'U+4E8C',
      character: '二',
      frequencyRank: 2,
      meanings: ['two'],
      onYomi: [{ reading: 'ニ', romaji: 'ni' }],
      kunYomi: [{ reading: 'ふた', romaji: 'futa' }],
      strokes: 2,
      radicals: ['二'],
      exampleWords: [],
      jlptLevel: 5,
      gradeLevel: 1,
    },
    {
      id: 'U+4E09',
      character: '三',
      frequencyRank: 3,
      meanings: ['three'],
      onYomi: [{ reading: 'サン', romaji: 'san' }],
      kunYomi: [{ reading: 'みつ', romaji: 'mitsu' }],
      strokes: 3,
      radicals: ['一'],
      exampleWords: [],
      jlptLevel: 5,
      gradeLevel: 1,
    },
    {
      id: 'U+56DB',
      character: '四',
      frequencyRank: 4,
      meanings: ['four'],
      onYomi: [{ reading: 'シ', romaji: 'shi' }],
      kunYomi: [{ reading: 'よん', romaji: 'yon' }],
      strokes: 5,
      radicals: ['囗'],
      exampleWords: [],
      jlptLevel: 5,
      gradeLevel: 1,
    },
  ];

  describe('generateQuestion', () => {
    it('generates a valid question', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji);

      expect(question.id).toBeDefined();
      expect(question.type).toBeDefined();
      expect(question.question).toBeDefined();
      expect(question.correctAnswer).toBeDefined();
      expect(question.options).toHaveLength(4);
      expect(question.correctKanjiId).toBe('U+4E00');
    });

    it('includes correct answer in options', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji);

      expect(question.options).toContain(question.correctAnswer);
    });

    it('generates kanji-to-meaning question when specified', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji, 'kanji-to-meaning');

      expect(question.type).toBe('kanji-to-meaning');
      expect(question.question).toContain('一');
      expect(question.correctAnswer).toBe('one');
    });

    it('generates meaning-to-kanji question when specified', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji, 'meaning-to-kanji');

      expect(question.type).toBe('meaning-to-kanji');
      expect(question.question).toContain('one');
      expect(question.correctAnswer).toBe('一');
    });

    it('generates kanji-to-reading question when specified', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji, 'kanji-to-reading');

      expect(question.type).toBe('kanji-to-reading');
      expect(question.question).toContain('一');
      expect(['イチ', 'イツ']).toContain(question.correctAnswer);
    });

    it('generates different distractors for each question', () => {
      const question1 = QuizService.generateQuestion(mockKanji[0], mockKanji, 'kanji-to-meaning');
      const question2 = QuizService.generateQuestion(mockKanji[1], mockKanji, 'kanji-to-meaning');

      expect(question1.correctAnswer).not.toBe(question2.correctAnswer);
    });

    it('handles kanji with multiple on-yomi readings', () => {
      const question = QuizService.generateQuestion(mockKanji[0], mockKanji, 'kanji-to-reading');

      expect(question.options.length).toBe(4);
      expect(question.options).toContain(question.correctAnswer);
    });
  });

  describe('question generation with limited kanji set', () => {
    it('handles small kanji dataset gracefully', () => {
      const smallSet = mockKanji.slice(0, 2);
      const question = QuizService.generateQuestion(smallSet[0], smallSet);

      // With only 2 kanji, may have fewer than 4 options
      expect(question.options.length).toBeGreaterThan(0);
      expect(question.options.length).toBeLessThanOrEqual(4);
      expect(question.options).toContain(question.correctAnswer);
    });
  });
});
