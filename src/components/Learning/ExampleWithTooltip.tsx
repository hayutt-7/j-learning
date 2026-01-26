'use client';

import { useState } from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';

interface ExampleWithTooltipProps {
    japaneseText: string;
    index: number;
}

export function ExampleWithTooltip({ japaneseText, index }: ExampleWithTooltipProps) {
    const [translation, setTranslation] = useState<{
        korean: string;
        furigana: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadTranslation = async () => {
        if (hasLoaded || isLoading) return;

        setIsLoading(true);
        try {
            // Simple translation via Groq
            const response = await fetch('/api/translate-example', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: japaneseText }),
            });

            if (response.ok) {
                const data = await response.json();
                setTranslation(data);
                setHasLoaded(true);
            }
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <HoverCard.Root openDelay={200} onOpenChange={(open) => open && loadTranslation()}>
            <HoverCard.Trigger asChild>
                <li className="text-[14px] text-gray-600 dark:text-gray-400 pl-4 border-l-[3px] border-indigo-100 dark:border-indigo-900 py-0.5 leading-relaxed cursor-help hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {japaneseText}
                </li>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content
                    className="z-50 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl animate-in fade-in-0 zoom-in-95"
                    sideOffset={5}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>번역 중...</span>
                        </div>
                    ) : translation ? (
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">읽기</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">{translation.furigana}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1">한국어</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{translation.korean}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            호버하여 번역 보기
                        </div>
                    )}
                    <HoverCard.Arrow className="fill-white dark:fill-gray-800" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    );
}
