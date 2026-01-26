'use server';

import { analyzeJapaneseWithGroq, chatWithGroq, analyzeLongTextWithGroq } from "@/lib/llm";
import { AnalysisResult } from "@/lib/types";

export async function translateAndAnalyze(text: string): Promise<AnalysisResult> {
    if (!text.trim()) {
        throw new Error("Text is required");
    }

    try {
        const result = await analyzeJapaneseWithGroq(text);

        // Fix: Ensure unique IDs for items to prevent collision with previously mastered items
        if (result.items) {
            result.items = result.items.map(item => ({
                ...item,
                id: crypto.randomUUID()
            }));
        }

        return result;
    } catch (error: any) {
        console.error("Translation error:", error);
        // Returning the error as data to bypass Next.js production error masking
        return {
            translatedText: "",
            items: [],
            error: `API Error: ${error.message || JSON.stringify(error)}`
        };
    }
}

export async function chatWithAI(message: string, context: string, history: any[]) {
    try {
        return await chatWithGroq(message, context, history);
    } catch (error) {
        console.error("Chat error:", error);
        return "죄송합니다. 오류가 발생했습니다.";
    }
}

export async function analyzeContent(text: string): Promise<AnalysisResult[]> {
    if (!text.trim()) throw new Error("Text is required");

    try {
        const results = await analyzeLongTextWithGroq(text);

        // Fix: Ensure unique IDs for all items
        return results.map(result => ({
            ...result,
            items: (result.items || []).map(item => ({
                ...item,
                id: crypto.randomUUID()
            }))
        }));
    } catch (error) {
        console.error("Content analysis error:", error);
        // Fallback: Treat as single sentence or return error
        throw new Error("콘텐츠 분석에 실패했습니다.");
    }
}

