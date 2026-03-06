import { KanjiCharacter } from '../../types/kanji';

export interface QuizQuestion {
  id: string;
  type: 'kanji-to-meaning' | 'meaning-to-kanji' | 'kanji-to-reading';
  question: string;
  correctAnswer: string;
  options: string[];
  correctKanjiId: string;
}

export class QuizService {
  /**
   * Generate a quiz question from a kanji character
   */
  static generateQuestion(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[],
    type?: QuizQuestion['type']
  ): QuizQuestion {
    const questionType =
      type || this.getRandomQuestionType(['kanji-to-meaning', 'meaning-to-kanji', 'kanji-to-reading']);

    switch (questionType) {
      case 'kanji-to-meaning':
        return this.generateKanjiToMeaning(targetKanji, allKanji);
      case 'meaning-to-kanji':
        return this.generateMeaningToKanji(targetKanji, allKanji);
      case 'kanji-to-reading':
        return this.generateKanjiToReading(targetKanji, allKanji);
      default:
        return this.generateKanjiToMeaning(targetKanji, allKanji);
    }
  }

  /**
   * Question: "What does 一 mean?"
   * Options: ["one", "two", "three", "person"]
   */
  private static generateKanjiToMeaning(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[]
  ): QuizQuestion {
    const correctAnswer = targetKanji.meanings[0]; // Use first meaning
    const distractors = this.getMeaningDistractors(targetKanji, allKanji, 3);

    return {
      id: `${targetKanji.id}_meaning`,
      type: 'kanji-to-meaning',
      question: `What does ${targetKanji.character} mean?`,
      correctAnswer,
      options: this.shuffleArray([correctAnswer, ...distractors]),
      correctKanjiId: targetKanji.id,
    };
  }

  /**
   * Question: "Which kanji means 'one'?"
   * Options: ["一", "二", "三", "人"]
   */
  private static generateMeaningToKanji(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[]
  ): QuizQuestion {
    const correctAnswer = targetKanji.character;
    const distractors = this.getKanjiDistractors(targetKanji, allKanji, 3);

    return {
      id: `${targetKanji.id}_kanji`,
      type: 'meaning-to-kanji',
      question: `Which kanji means "${targetKanji.meanings[0]}"?`,
      correctAnswer,
      options: this.shuffleArray([correctAnswer, ...distractors]),
      correctKanjiId: targetKanji.id,
    };
  }

  /**
   * Question: "How do you read 一?"
   * Options: ["いち", "に", "さん", "よん"]
   */
  private static generateKanjiToReading(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[]
  ): QuizQuestion {
    // Prefer on-yomi, fallback to kun-yomi
    const correctReading =
      targetKanji.onYomi[0]?.reading || targetKanji.kunYomi[0]?.reading || '?';
    const distractors = this.getReadingDistractors(targetKanji, allKanji, 3);

    return {
      id: `${targetKanji.id}_reading`,
      type: 'kanji-to-reading',
      question: `How do you read ${targetKanji.character}?`,
      correctAnswer: correctReading,
      options: this.shuffleArray([correctReading, ...distractors]),
      correctKanjiId: targetKanji.id,
    };
  }

  /**
   * Get distractor meanings from other kanji
   */
  private static getMeaningDistractors(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[],
    count: number
  ): string[] {
    const otherKanji = allKanji.filter((k) => k.id !== targetKanji.id);
    const distractors: string[] = [];

    // Shuffle and pick meanings
    const shuffled = this.shuffleArray(otherKanji);

    for (const kanji of shuffled) {
      if (distractors.length >= count) break;

      // Use first meaning that doesn't match target
      const meaning = kanji.meanings[0];
      if (
        meaning &&
        !targetKanji.meanings.includes(meaning) &&
        !distractors.includes(meaning)
      ) {
        distractors.push(meaning);
      }
    }

    // If we don't have enough distractors, fill with generic ones
    const fallbackDistractors = [
      'big',
      'small',
      'old',
      'new',
      'good',
      'bad',
      'up',
      'down',
      'left',
      'right',
    ];
    while (distractors.length < count) {
      const fallback = fallbackDistractors[distractors.length % fallbackDistractors.length];
      if (!targetKanji.meanings.includes(fallback) && !distractors.includes(fallback)) {
        distractors.push(fallback);
      }
    }

    return distractors.slice(0, count);
  }

  /**
   * Get distractor kanji characters
   */
  private static getKanjiDistractors(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[],
    count: number
  ): string[] {
    const otherKanji = allKanji.filter((k) => k.id !== targetKanji.id);

    // Prefer similar stroke count for better distractors
    const similarKanji = otherKanji
      .sort((a, b) => {
        const diffA = Math.abs(a.strokes - targetKanji.strokes);
        const diffB = Math.abs(b.strokes - targetKanji.strokes);
        return diffA - diffB;
      })
      .slice(0, count);

    return similarKanji.map((k) => k.character);
  }

  /**
   * Get distractor readings from other kanji
   */
  private static getReadingDistractors(
    targetKanji: KanjiCharacter,
    allKanji: KanjiCharacter[],
    count: number
  ): string[] {
    const otherKanji = allKanji.filter((k) => k.id !== targetKanji.id);
    const distractors: string[] = [];

    // Shuffle and pick readings
    const shuffled = this.shuffleArray(otherKanji);

    for (const kanji of shuffled) {
      if (distractors.length >= count) break;

      // Get first on-yomi or kun-yomi reading
      const reading =
        kanji.onYomi[0]?.reading || kanji.kunYomi[0]?.reading;

      if (reading && !distractors.includes(reading)) {
        // Make sure it's not the correct reading
        const targetReadings = [
          ...targetKanji.onYomi.map((r) => r.reading),
          ...targetKanji.kunYomi.map((r) => r.reading),
        ];
        if (!targetReadings.includes(reading)) {
          distractors.push(reading);
        }
      }
    }

    return distractors.slice(0, count);
  }

  /**
   * Get a random question type
   */
  private static getRandomQuestionType(
    types: QuizQuestion['type'][]
  ): QuizQuestion['type'] {
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
