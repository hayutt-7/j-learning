import { Volume2, Copy, Check, MessageCircleQuestion } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ResultAreaProps {
    result: AnalysisResult;
    isLoading?: boolean;
    onChatClick?: () => void;
}

export function ResultArea({ result, isLoading, onChatClick }: ResultAreaProps) {
    const [copied, setCopied] = useState(false);

    const handleTTS = () => {
        if (!result.translatedText) return;
        const utterance = new SpeechSynthesisUtterance(result.translatedText);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
    };

    const handleCopy = async () => {
        if (!result.translatedText) return;
        try {
            await navigator.clipboard.writeText(result.translatedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (!result) return null;

    return (
        <div className="group relative mt-6 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 transition-all">
            <div className="flex items-start justify-between gap-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed font-sans flex flex-wrap gap-x-1 gap-y-2 flex-1">
                    {result.tokens && result.tokens.length > 0 ? (
                        result.tokens.map((token, idx) => (
                            <span key={idx} className="inline-block">
                                {token.reading ? (
                                    <ruby className="flex flex-col items-center group/ruby cursor-help">
                                        <rt className="text-[11px] text-indigo-500 dark:text-indigo-400 font-normal mb-0.5 select-none opacity-70 group-hover/ruby:opacity-100 transition-opacity">{token.reading}</rt>
                                        <span>{token.text}</span>
                                    </ruby>
                                ) : (
                                    <span>{token.text}</span>
                                )}
                            </span>
                        ))
                    ) : (
                        <span>{result.translatedText}</span>
                    )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        title="텍스트 복사"
                    >
                        {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={handleTTS}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        title="듣기"
                    >
                        <Volume2 className="h-5 w-5" />
                    </button>
                    {onChatClick && (
                        <button
                            onClick={onChatClick}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            title="AI 튜터에게 질문하기"
                        >
                            <MessageCircleQuestion className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-4 text-xs text-indigo-500/60 dark:text-indigo-400/60 font-medium tracking-wide">
                번역 결과
            </div>
        </div>
    );
}
