'use server';

import { analyzeJapaneseWithGemini, chatWithGemini } from "@/lib/gemini";
import { AnalysisResult } from "@/lib/types";

export async function translateAndAnalyze(text: string): Promise<AnalysisResult> {
    if (!text.trim()) {
        throw new Error("Text is required");
    }

    try {
        return await analyzeJapaneseWithGemini(text);
    } catch (error: unknown) {
        console.error("Translation error:", error);

        // Fallback to Mock Data
        console.log("Falling back to Mock Data...");
        try {
            const { analyzeText } = await import('@/lib/mockAnalyzer');
            const mockResult = await analyzeText(text);
            return { ...mockResult, isMock: true };
        } catch (mockError) {
            console.error("Mock fallback failed:", mockError);
            throw new Error("서비스를 사용할 수 없습니다.");
        }
    }
}

export async function chatWithAI(message: string, context: string, history: any[]) {
    try {
        return await chatWithGemini(message, context, history);
    } catch (error) {
        console.error("Chat error:", error);
        return "죄송합니다. 오류가 발생했습니다.";
    }
}
