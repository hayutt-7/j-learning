import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
    try {
        const { artist, title } = await request.json();

        const prompt = `You are a Japanese music expert. A user is looking for the song:
Artist: ${artist || '(not specified)'}
Title: ${title || '(not specified)'}

Your task:
1. If you can identify the song, confirm the correct title and artist name (in Japanese and romanized).
2. Generate 8-10 example sentences that contain vocabulary and grammar patterns commonly found in this song's style/genre.
3. Extract 10-15 key vocabulary words and grammar patterns from these sentences.

IMPORTANT: Generate realistic Japanese sentences that would fit the song's emotional tone and style.

Respond in this exact JSON format:
{
    "confirmed": true,
    "title": "Japanese title",
    "artist": "Artist name",
    "sentences": [
        "Japanese sentence 1",
        "Japanese sentence 2"
    ],
    "vocabItems": [
        {
            "id": "song_v1",
            "text": "Japanese word/grammar",
            "reading": "hiragana reading",
            "meaning": "Korean meaning",
            "type": "vocab",
            "jlpt": "N3",
            "example": "Example sentence (Korean translation)",
            "explanation": ""
        }
    ]
}

If you cannot identify the song, return:
{
    "confirmed": false,
    "title": "Unknown",
    "artist": "Unknown",
    "sentences": [],
    "vocabItems": []
}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const data = JSON.parse(content);

        if (!data.confirmed) {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Song API error:', error);
        return NextResponse.json({ error: 'Failed to process song' }, { status: 500 });
    }
}
