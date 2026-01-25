import { Volume2, Copy, Check, MessageCircleQuestion } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { TokenTooltip } from './TokenTooltip';
import { useLearningHistory } from '@/hooks/useLearningHistory';

interface ResultAreaProps {
    result: AnalysisResult;
    isLoading?: boolean;
    onChatClick?: () => void;
}

export function ResultArea({ result, isLoading, onChatClick }: ResultAreaProps) {
    const [copied, setCopied] = useState(false);
    const { isMastered } = useLearningHistory();

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
        <div className="relative group">
            <div className="flex items-end justify-between gap-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed font-sans flex flex-wrap items-end gap-x-1 gap-y-2 flex-1">
                    {result.tokens && result.tokens.length > 0 ? (
                        result.tokens.map((token, idx) => {
                            const matchedItem = result.items.find(item =>
                                item.text === token.text ||
                                (token.reading && item.reading === token.reading && item.text === token.text)
                            );

                            const mastered = matchedItem ? isMastered(matchedItem.id) : false;

                            return (
                                <span key={idx} className="inline-block mx-0.5">
                                    <TokenTooltip item={matchedItem} reading={token.reading}>
                                        {token.reading && token.reading !== token.text ? (
                                            <ruby className="flex flex-col items-center group/ruby">
                                                <rt className={cn(
                                                    "text-[11px] font-medium mb-0.5 select-none opacity-100 group-hover/ruby:opacity-100 transition-opacity",
                                                    mastered ? "text-gray-300 dark:text-gray-600" : "text-indigo-600 dark:text-indigo-300"
                                                )}>{token.reading}</rt>
                                                <span className={cn(
                                                    "transition-colors",
                                                    mastered && "text-gray-300 dark:text-gray-600 font-normal decoration-gray-200"
                                                )}>{token.text}</span>
                                            </ruby>
                                        ) : (
                                            <span className={cn(
                                                "transition-colors",
                                                mastered && "text-gray-300 dark:text-gray-600 font-normal"
                                            )}>{token.text}</span>
                                        )}
                                    </TokenTooltip>
                                </span>
                            );
                        })
                    ) : (
                        <span>{result.translatedText}</span>
                    )}
                </div>

                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        title="텍스트 복사"
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleTTS}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        title="듣기"
                    >
                        <Volume2 className="h-4 w-4" />
                    </button>
                    {onChatClick && (
                        <button
                            onClick={onChatClick}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            title="AI 튜터에게 질문하기"
                        >
                            <MessageCircleQuestion className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
