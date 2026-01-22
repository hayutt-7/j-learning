import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
    try {
        const { word, meaning } = await request.json();

        const prompt = `Generate a simple, natural Japanese example sentence for the word "${word}" (meaning: ${meaning}).
Target JLPT level: N4-N3 level (not too complex).
Format: Japanese sentence followed by Korean translation in parentheses.

Example output:
毎日コーヒーを飲みます。(매일 커피를 마십니다)

Output ONLY the sentence string.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100,
        });

        const sentence = completion.choices[0]?.message?.content?.trim() || '';
        return NextResponse.json({ sentence });
    } catch (error) {
        console.error('Example API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
