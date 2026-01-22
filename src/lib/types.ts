export type LearningItemType = 'grammar' | 'vocab';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;

export interface Token {
    text: string;
    reading?: string; // Furigana in hiragana/katakana
    romaji?: string;
}

export interface LearningItem {
    id: string; // "grammar-polite-form", "vocab-arigatou"
    text: string; // "desu/masu", "ありがとう"
    type: LearningItemType;
    meaning: string;
    explanation: string;
    nuance?: string;
    examples?: string[];
    example?: string; // Single example sentence for vocab cards
    // New fields
    jlpt?: JLPTLevel;
    pitchAccent?: string; // e.g., "平板型 (Heiban)"
    reading?: string;
}

export interface LearningHistoryItem {
    itemId: string;
    text?: string;
    type?: LearningItemType;
    meaning?: string;
    exposureCount: number;
    isMastered: boolean;
    lastSeenAt: number;
    // New fields for history
    jlpt?: JLPTLevel;
    reading?: string; // Stored furigana/reading
    // SRS fields (Spaced Repetition)
    easeFactor: number;      // Multiplier (default 2.5)
    interval: number;        // Days until next review
    repetitions: number;     // Consecutive correct answers
    nextReviewDate: number;  // Timestamp for next review
}

export interface AnalysisResult {
    translatedText: string;
    tokens?: Token[]; // For rendering with furigana
    items: LearningItem[];
    isMock?: boolean;
}

export type LearningHistoryMap = Record<string, LearningHistoryItem>;
