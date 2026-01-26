import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(request: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    try {
        const { artist, title, userLyrics, youtubeUrl } = await request.json();

        // 1. YouTube Analysis (Still requires Groq for generation, but we skip transcript extraction)
        if (youtubeUrl) {
            // Skip YouTube for now as it wasn't the main focus, or valid logic can be added later.
            // For now, let's focus on userLyrics and Song Search which users asked for.
        }

        // 2. User Lyrics Analysis
        if (userLyrics && userLyrics.trim()) {
            const lyricsPrompt = `다음은 일본어 노래 가사입니다. 이 가사를 분석해서 학습 콘텐츠를 만들어주세요.

가사:
${userLyrics}

다음 JSON 형식으로 응답해주세요:
{
    "confirmed": true,
    "title": "사용자 입력 가사",
    "artist": "직접 입력",
    "sentences": ["가사의 각 문장을 배열로"],
    "vocabItems": [
        {
            "id": "lyrics_v1",
            "text": "일본어 단어/문법",
            "reading": "히라가나 읽기",
            "meaning": "한국어 뜻",
            "type": "vocab",
            "jlpt": "N3",
            "example": "예문 (한국어 번역)",
            "explanation": "문법 설명"
        }
    ]
}

가사에서 핵심 단어와 문법 10-15개를 추출하고, 각 문장을 sentences 배열에 넣어주세요.`;

            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: lyricsPrompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || "{}";
            const data = JSON.parse(content);
            return NextResponse.json(data);
        }

        // 3. Search for song by artist/title
        const prompt = `You are a Japanese music expert. A user is looking for the lyrics of:
Artist: ${artist || '(not specified)'}
Title: ${title || '(not specified)'}

YOUR TASK:
1. Provide the **ACTUAL JAPANESE LYRICS** for this song.
2. If the song is famous (like YOASOBI's "Yoru ni Kakeru"), output the REAL lyrics.
3. If you don't know the exact song, generate realistic J-Pop lyrics in that style.

**CRITICAL**: Return the lyrics as a list of strings in the 'sentences' array. 
The lyrics should be in natural Japanese (Kanji/Hiragana).

Respond in this exact JSON format:
{
    "confirmed": true,
    "title": "${title || 'Song Title'}",
    "artist": "${artist || 'Artist Name'}",
    "sentences": [
        "First line of lyrics...",
        "Second line of lyrics..."
    ],
    "vocabItems": [] 
}
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5, // Reduced temp for more accurate retrieval
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || "{}";
        let data;
        try {
            data = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error", e);
            throw new Error("Failed to parse API response");
        }

        // Validate data
        if (!data.sentences || data.sentences.length === 0) {
            // Fallback if empty
            data.title = title || "Unknown Song";
            data.artist = artist || "Unknown Artist";
            data.sentences = [
                "歌詞が見つかりませんでした。",
                "가사를 찾을 수 없습니다."
            ];
        }

        return NextResponse.json({ ...data, confirmed: true });

    } catch (error) {
        console.error('Song API error:', error);
        return NextResponse.json({
            confirmed: false,
            title: "Error",
            artist: "System",
            sentences: ["오류가 발생했습니다. 잠시 후 다시 시도해주세요."],
            vocabItems: []
        }, { status: 500 });
    }
}
