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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Message */}
            <div className="sticky top-0 z-10 py-2 -mx-4 px-4 bg-gray-50/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 supports-[backdrop-filter]:dark:bg-black/80">
                <div className="flex justify-end">
                    <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                            <p className="text-sm font-medium">{userInput}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[95%] w-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {/* Translation Result */}
                        <ResultArea result={result} onChatClick={onChatClick} />

                        {/* Analysis Cards */}
                        {result.items && result.items.length > 0 && (
                            <div className="mt-4">
                                <AnalysisList items={result.items} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
