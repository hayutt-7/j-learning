import Groq from "groq-sdk";
import { AnalysisResult } from "./types";

const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey });

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
   - "reading": Hiragana for Kanji.
3. **Items**: Identify key vocabulary and grammar points.
   - **JLPT**: Estimate JLPT level (N5-N1).
   - **Pitch Accent**: Provide pitch accent if possible.
   - **Explanation**: Explain in KOREAN.

Response Format (JSON only, no markdown):
{
  "translatedText": "string",
  "tokens": [
    { "text": "私", "reading": "わたし", "romaji": "watashi" }
  ],
  "items": [
    {
      "id": "unique-id",
      "text": "word",
      "type": "vocab",
      "meaning": "Korean meaning",
      "reading": "reading",
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Low temperature for consistent JSON
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(responseText) as AnalysisResult;

    if (!data.translatedText || data.translatedText.trim() === "") {
      throw new Error("Invalid response from Groq: Missing translatedText");
    }

    return data;
  } catch (error) {
    console.error("Groq Analysis Error:", error);
    throw new Error("Failed to analyze text with Groq");
  }
}

export async function chatWithGroq(message: string, context: string, history: Array<{ role: 'user' | 'assistant', content: string }>) {
  const systemPrompt = `당신은 일본어 학습을 도와주는 친절한 AI 튜터입니다.
사용자가 현재 공부하고 있는 문장(Context)에 대해 질문하면, 문법, 단어 뉘앙스, 문화적 배경 등을 자세히 설명해주세요.
한국어로 답변하고, 일본어 예시가 있다면 후리가나나 한글 발음을 함께 적어주세요.
격식 있고 부드러운 말투를 사용하세요.`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: `Context: "${context}"\n\nQuestion: ${message}` }
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";
}
