import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "./types";

const apiKey = process.env.GEMINI_API_KEY;

export async function analyzeJapanese(koreanText: string): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
You are a Japanese language tutor for Korean speakers.
Translate the following Korean text to natural Japanese, and provide a detailed analysis of the grammar, vocabulary, nuance, and pronunciation.

Input Korean: "${koreanText}"

Requirements:
1. **Translation**: Natural Japanese suitable for the context.
2. **Tokens**: Break down the translated Japanese into small tokens (words/particles) and provide the reading (Furigana) for each Kanji. 
   - If a token is Kana only, 'reading' can be same as text or omitted.
   - For Kanji, provide the reading in Hiragana.
3. **Items**: Identify key vocabulary and grammar points used in the translation.
   - **JLPT**: Estimate the JLPT level (N5-N1).
   - **Pitch Accent**: Provide the pitch accent pattern name (e.g., Heiban, Atamadaka, Nakadaka, Odaka) if applicable for vocabulary.
   - **Nuance**: Explain *why* this word/grammar was chosen over others (e.g., politeness level).
   - **Explanation**: Explain clearly in KOREAN.

Response Format (JSON):
{
  "translatedText": "string (The full Japanese sentence)",
  "tokens": [
    { "text": "私", "reading": "わたし", "romaji": "watashi" },
    { "text": "は", "reading": "は", "romaji": "wa" }
  ],
  "items": [
    {
      "id": "unique-id (e.g., vocab-watashi)",
      "text": "word or grammar pattern",
      "type": "vocab" or "grammar",
      "meaning": "Korean meaning",
      "reading": "getting reading",
      "explanation": "Korean explanation",
      "nuance": "Korean nuance explanation",
      "jlpt": "N5",
      "pitchAccent": "Heiban",
      "examples": ["Example sentence 1", "Example sentence 2"]
    }
  ]
}
`;
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const data = JSON.parse(responseText) as AnalysisResult;
      return data;
    } catch (error: unknown) {
      lastError = error as Error;
      console.error(`Gemini Analysis Error (attempt ${attempt + 1}):`, error);

      // Check if it's a rate limit error (429)
      const errorMessage = String(error);
      if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      break;
    }
  }

  throw lastError || new Error("Failed to analyze text with Gemini");
}
