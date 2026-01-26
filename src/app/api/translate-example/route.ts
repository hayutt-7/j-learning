import { NextResponse } from 'next/server';
import { analyzeJapaneseWithGroq, translateExampleWithGroq } from '@/lib/llm';

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

        // Use the dedicated function for example translation
        const { korean, furigana } = await translateExampleWithGroq(text);

        return NextResponse.json({
            korean,
            furigana
        });

    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Failed to translate' },
            { status: 500 }
        );
    }
}
