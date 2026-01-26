import Groq from "groq-sdk";
import { AnalysisResult } from "./types";

const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({
    apiKey: apiKey || "",
});

export async function analyzeJapaneseWithGroq(koreanText: string): Promise<AnalysisResult> {
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const prompt = `
You are a Japanese language tutor for Korean speakers.
Translate the following Korean text to natural Japanese, and provide a detailed analysis.

Input Korean: "${koreanText}"

Requirements:
1. **Translation**: Natural Japanese suitable for the context.
2. **Tokens**: Break down the translated Japanese into small tokens (words/particles).
   - "text": The original token as it appears in the sentence (may include Kanji).
   - "reading": **CRITICAL** - This MUST be the HIRAGANA pronunciation of the token.
     - For Kanji words: reading MUST be hiragana. Example: text="私" → reading="わたし", text="日本語" → reading="にほんご"
     - For Hiragana/Katakana words: reading can be empty string "" or omitted.
     - **NEVER** return Kanji as reading. The reading field must ONLY contain hiragana or be empty.
   - "romaji": Romanized pronunciation.
3. **Items**: Identify key vocabulary and grammar points.
   - **JLPT**: Estimate JLPT level (N5-N1).
   - **Pitch Accent**: Provide pitch accent if possible.
   - **Explanation**: Explain in KOREAN.
   - **IMPORTANT**: You MUST extract at least one item (vocab or grammar) from the sentence.

Response Format (JSON only):
{
  "translatedText": "Japanese translation",
  "tokens": [
    { "text": "私", "reading": "わたし", "romaji": "watashi" },
    { "text": "は", "reading": "", "romaji": "wa" }
  ],
  "items": [
    {
      "id": "unique-id",
      "text": "word",
      "type": "vocab",
      "meaning": "Korean meaning",
      "reading": "hiragana",
      "explanation": "Korean explanation",
      "nuance": "nuance",
      "jlpt": "N5",
      "pitchAccent": "Heiban",
      "examples": ["Example 1"]
    }
  ]
}
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0]?.message?.content || "";

        if (!responseText) {
            throw new Error("Empty response from Groq");
        }

        const data = JSON.parse(responseText) as AnalysisResult;

        if (!data.translatedText || data.translatedText.trim() === "") {
            throw new Error("Invalid response from Groq: Missing translatedText");
        }

        // Defensive coding: Ensure arrays exist
        data.items = data.items || [];
        data.tokens = data.tokens || [];

        return data;
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        throw new Error(`Failed to analyze text with Groq: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function chatWithGroq(
    message: string,
    context: string,
    history: Array<{ role: "user" | "assistant"; content: string }>
) {
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const systemPrompt = `당신은 일본어 학습을 도와주는 친절한 AI 튜터입니다.
사용자가 현재 공부하고 있는 문장(Context)에 대해 질문하면, 문법, 단어 뉘앙스, 문화적 배경 등을 자세히 설명해주세요.
한국어로 답변하고, 일본어 예시가 있다면 후리가나나 한글 발음을 함께 적어주세요.
격식 있고 부드러운 말투를 사용하세요.
Context: "${context}"`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...history.map((msg) => ({
                    role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
                    content: msg.content,
                })),
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.8,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";
    } catch (error) {
        console.error("Groq Chat Error:", error);
        return "답변을 생성할 수 없습니다.";
    }
}

export async function analyzeLongTextWithGroq(contextText: string): Promise<AnalysisResult[]> {
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const prompt = `
You are a Japanese language tutor.
Analyze the following text (lyrics, script, etc.).
Split the text into meaningful sentences or lines (if it's lyrics, keep the lines).
For EACH line/sentence, provide a detailed analysis in the specified JSON format.

Input Text:
"""
${contextText}
"""

Requirements:
1. **Split**: Break down the text line by line.
2. **Translation**: Korean translation for each line.
3. **Analysis**: For each line, provide tokens and key items (vocab/grammar).
   - "tokens": Break down into words. "reading" MUST be HIRAGANA.
   - "items": Extract detailed vocab/grammar points.

Response Format (JSON Array of Objects):
[
  {
    "translatedText": "Korean translation of line 1",
    "tokens": [...],
    "items": [...]
  },
  {
    "translatedText": "Korean translation of line 2",
    "tokens": [...],
    "items": [...]
  }
]
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0]?.message?.content || "";

        if (!responseText) {
            throw new Error("Empty response from Groq");
        }

        // Groq might wrap the array in an object, so we need to handle both cases
        let data;
        try {
            const parsed = JSON.parse(responseText);
            // If it's an object with an array property, extract the array
            if (parsed.results && Array.isArray(parsed.results)) {
                data = parsed.results;
            } else if (parsed.lines && Array.isArray(parsed.lines)) {
                data = parsed.lines;
            } else if (Array.isArray(parsed)) {
                data = parsed;
            } else {
                // If it's a single object, wrap it in an array
                data = [parsed];
            }
        } catch {
            throw new Error("Invalid JSON response");
        }

        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: Expected array");
        }

        return data as AnalysisResult[];
    } catch (error) {
        console.error("Groq Long Text Analysis Error:", error);
        throw new Error("Failed to analyze long text");
    }
}

export async function translateExampleWithGroq(japaneseText: string): Promise<{ korean: string; furigana: string }> {
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const prompt = `
You are a Japanese-Korean translator.
Translate the following Japanese text to natural Korean.
Also provide the reading (furigana) for the entire Japanese sentence in Hiragana.

Input Japanese: "${japaneseText}"

Response Format (JSON only):
{
  "korean": "한국어 번역 결과",
  "furigana": "전체 문장을 히라가나로 변환한 결과"
}
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3, // Lower temperature for more deterministic translation
            max_tokens: 512,
            response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0]?.message?.content || "";
        if (!responseText) throw new Error("Empty response");

        const data = JSON.parse(responseText);
        return {
            korean: data.korean || "번역 실패",
            furigana: data.furigana || japaneseText
        };
    } catch (error) {
        console.error("Example Translation Error:", error);
        return {
            korean: "번역을 불러올 수 없습니다.",
            furigana: japaneseText
        };
    }
}

export async function generateQuoteWithGroq(theme: string = 'Life'): Promise<AnalysisResult> {
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const themePrompt = theme === 'Random' ? 'any inspiring theme' : theme;

    const prompt = `
You are a wise Japanese mentor.
Generate an inspiring Japanese quote or proverb about "${themePrompt}".
It can be a famous quote or a common proverb.

Requirements:
1. **Quote**: Natural Japanese quote (Kanji mixed).
2. **Translation**: Korean translation.
3. **Analysis**: Break it down and analyze key vocabulary.

Response Format (JSON only):
{
  "translatedText": "Korean translation of the quote",
  "tokens": [
    { "text": "七", "reading": "なな", "romaji": "nana" },
    { "text": "転", "reading": "ころ", "romaji": "kori" }
  ],
  "items": [
    {
      "id": "unique-id",
      "text": "Quote in Japanese",
      "type": "quote",
      "meaning": "Korean meaning",
      "reading": "Hiragana reading of the full quote",
      "explanation": "Origin or deeper meaning of the quote in Korean",
      "nuance": "Theme (e.g. Life, Success)",
      "jlpt": "N/A",
      "examples": ["Example usage if applicable"]
    },
    {
      "id": "unique-id-2",
      "text": "Key Word from quote",
      "type": "vocab",
      "meaning": "Meaning",
      "reading": "Reading",
      "explanation": "Explanation",
      "examples": []
    }
  ]
}
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.9, // Creative
            max_tokens: 1024,
            response_format: { type: "json_object" },
        });

        const responseText = completion.choices[0]?.message?.content || "";
        if (!responseText) throw new Error("Empty response");

        const data = JSON.parse(responseText) as AnalysisResult;

        // Ensure arrays exist
        data.items = data.items || [];
        data.tokens = data.tokens || [];

        return data;
    } catch (error) {
        console.error("Quote Generation Error:", error);
        throw new Error("Failed to generate quote");
    }
}

export async function translateQueryToJapanese(query: string): Promise<string> {
    if (!apiKey) return query; // No API key, fallback to original

    // Simple check: if already Japanese or English, return as is (optimization)
    // But user might input "사과" (Apple). We need to translate.

    const prompt = `
Translate this Korean word/phrase to Japanese for dictionary lookup.
Only return the Japanese word/kanji. No explanations.
Input: "${query}"
Output:
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 20,
        });

        return completion.choices[0]?.message?.content?.trim() || query;
    } catch {
        return query;
    }
}
