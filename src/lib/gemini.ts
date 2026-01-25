import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "./types";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function analyzeJapaneseWithGemini(koreanText: string): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

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

Response Format (JSON only):
{
  "translatedText": "string",
  "tokens": [
    { "text": "私", "reading": "わたし", "romaji": "watashi" },
    { "text": "は", "reading": "", "romaji": "wa" },
    { "text": "日本語", "reading": "にほんご", "romaji": "nihongo" },
    { "text": "を", "reading": "", "romaji": "wo" },
    { "text": "勉強", "reading": "べんきょう", "romaji": "benkyou" }
  ],
  "items": [
    {
      "id": "unique-id",
      "text": "word",
      "type": "vocab",
      "meaning": "Korean meaning",
      "reading": "reading in hiragana",
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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText) as AnalysisResult;

    if (!data.translatedText || data.translatedText.trim() === "") {
      throw new Error("Invalid response from Gemini: Missing translatedText");
    }

    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze text with Gemini");
  }
}

export async function chatWithGemini(message: string, context: string, history: Array<{ role: 'user' | 'assistant', content: string }>) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const systemPrompt = `당신은 일본어 학습을 도와주는 친절한 AI 튜터입니다.
사용자가 현재 공부하고 있는 문장(Context)에 대해 질문하면, 문법, 단어 뉘앙스, 문화적 배경 등을 자세히 설명해주세요.
한국어로 답변하고, 일본어 예시가 있다면 후리가나나 한글 발음을 함께 적어주세요.
격식 있고 부드러운 말투를 사용하세요.
Context: "${context}"`;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ],
  });

  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "답변을 생성할 수 없습니다.";
  }
}
