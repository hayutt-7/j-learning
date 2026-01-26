import { NextResponse } from 'next/server';
import { generateQuoteWithGroq } from '@/lib/llm';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { theme } = await req.json();

        const result = await generateQuoteWithGroq(theme || 'Life');

        // Ensure unique IDs
        if (result.items) {
            result.items = result.items.map(item => ({
                ...item,
                id: crypto.randomUUID()
            }));
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Quote generation error:", error);
        return NextResponse.json(
            { error: 'Failed to generate quote' },
            { status: 500 }
        );
    }
}
