export interface Reading {
  reading: string;      // Hiragana/katakana: "イチ", "ひと"
  romaji: string;       // Romanized: "ichi", "hito"
}

export interface StrokePath {
  path: string;         // SVG path data
  strokeNumber: number; // Order (1-indexed)
}

export interface ExampleWord {
  word: string;         // Full word in Japanese: "一人"
  reading: string;      // Full reading: "ひとり"
  romaji: string;       // "hitori"
  meaning: string;      // "one person; alone"
  frequency?: number;   // Optional word frequency rank
}

export interface KanjiCharacter {
  id: string;                    // Unique identifier: "U+4E00"
  character: string;              // The kanji itself: "一"
  frequencyRank: number;          // 1 = most common
  meanings: string[];             // ["one", "single"]
  onYomi: Reading[];              // On'yomi readings
  kunYomi: Reading[];             // Kun'yomi readings
  strokes: number;                // Total stroke count
  strokeOrder?: StrokePath[];     // SVG paths for each stroke (optional for now)
  radicals: string[];             // Component radicals
  exampleWords: ExampleWord[];    // Context phrases/words
  jlptLevel?: number;             // Optional JLPT level (5-1)
  gradeLevel?: number;            // Optional school grade (1-6)
}
