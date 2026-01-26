import { NextResponse } from 'next/server';
import { analyzeJapaneseWithGroq } from '@/lib/llm';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Reuse the existing analysis function but just extract translation/reading
        // This is efficient because we already have the prompt tuned
        const analysis = await analyzeJapaneseWithGroq(text);

        // Extract furigana from tokens
        const furigana = (analysis.tokens || [])
            .map(t => t.reading || t.text) // Use reading if available (hiragana), otherwise text
            .join('');

        return NextResponse.json({
            korean: analysis.translatedText,
            furigana: furigana
        });

    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Failed to translate' },
            { status: 500 }
        );
    }
}
