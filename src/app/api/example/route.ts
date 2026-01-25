import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { word, meaning } = await request.json();

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Generate a simple, natural Japanese example sentence for the word "${word}" (meaning: ${meaning}).
Target JLPT level: N4-N3 level (not too complex).
Format: Japanese sentence followed by Korean translation in parentheses.

Example output:
毎日コーヒーを飲みます。(매일 커피를 마십니다)

Output ONLY the sentence string.`;

        const result = await model.generateContent(prompt);
        const sentence = result.response.text().trim();
        return NextResponse.json({ sentence });
    } catch (error) {
        console.error('Example API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
