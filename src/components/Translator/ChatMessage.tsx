'use client';

import { AnalysisResult } from '@/lib/types';
import { ResultArea } from './ResultArea';
import { AnalysisList } from '@/components/Learning/AnalysisList';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
    userInput: string;
    result: AnalysisResult;
    onChatClick?: () => void;
}

export function ChatMessage({ userInput, result, onChatClick }: ChatMessageProps) {
    return (
        <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            {/* Sticky Header: User Input + Translation */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 p-5 shadow-sm transition-all">
                {/* User Input (Compact) */}
                <div className="flex items-center gap-2 mb-3 opacity-60 hover:opacity-100 transition-opacity">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1">{userInput}</p>
                </div>

                {/* Translation Result */}
                <ResultArea result={result} onChatClick={onChatClick} />
            </div>

            {/* Scrollable Content: Analysis */}
            <div className="p-5 bg-gray-50/50 dark:bg-gray-900/20">
                {result.items && result.items.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analysis</span>
                        </div>
                        <AnalysisList items={result.items} />
                    </div>
                ) : (
                    <div className="py-2 text-center text-sm text-gray-400">
                        상세 분석 내용이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
