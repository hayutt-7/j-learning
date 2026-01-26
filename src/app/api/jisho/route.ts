import { NextResponse } from 'next/server';
import { translateQueryToJapanese } from '@/lib/llm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    try {
        // If keyword contains Korean characters, translate it first
        if (/[가-힣]/.test(keyword)) {
            keyword = await translateQueryToJapanese(keyword);
        }

        const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword!)}`);

        if (!response.ok) {
            throw new Error(`Jisho API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Jisho API Proxy Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from Jisho API' },
            { status: 500 }
        );
    }
}
