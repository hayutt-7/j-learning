import { LearningItem } from "./types";

export interface AnalysisResult {
    translatedText: string;
    items: LearningItem[];
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock logic for demo
    if (text.includes("안녕") || text.includes("반가워")) {
        return {
            translatedText: "こんにちは",
            items: [
                {
                    id: "vocab-konnichiwa",
                    text: "こんにちは",
                    type: "vocab",
                    meaning: "안녕하세요 (점심)",
                    explanation: "낮 시간에 사용하는 기본적인 인사말입니다.",
                    nuance: "격식/비격식 모두 사용 가능하지만, 친구 사이엔 'やあ' 등을 쓰기도 함.",
                    examples: ["A: こんにちは (안녕하세요)", "B: こんにちは (안녕하세요)"]
                },
                {
                    id: "grammar-greeting",
                    text: "인사말",
                    type: "grammar",
                    meaning: "기본 인사",
                    explanation: "일본어 인사는 시간대(오전/오후/저녁)에 따라 달라집니다.",
                    examples: ["おはよう (아침)", "こんばんは (저녁)"]
                }
            ]
        };
    }

    if (text.includes("감사") || text.includes("고마워")) {
        return {
            translatedText: "ありがとうございます",
            items: [
                {
                    id: "vocab-arigatou-gozaimasu",
                    text: "ありがとうございます",
                    type: "vocab",
                    meaning: "감사합니다",
                    explanation: "정중하게 감사를 표현할 때 사용합니다.",
                    nuance: "친구 사이에는 'ありがとう'만 사용.",
                },
                {
                    id: "grammar-masu",
                    text: "~ます",
                    type: "grammar",
                    meaning: "정중형 어미",
                    explanation: "동사의 정중한 형태를 만들 때 사용합니다.",
                    examples: ["食べます (먹습니다)", "行きます (갑니다)"]
                }
            ]
        };
    }

    // Default fallback
    return {
        translatedText: "日本語に翻訳します...",
        items: [
            {
                id: "vocab-demo",
                text: "デモ",
                type: "vocab",
                meaning: "데모",
                explanation: "이것은 시연용 응답입니다.",
            }
        ]
    };
}
