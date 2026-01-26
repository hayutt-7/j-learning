'use client';

import { useState, useEffect } from 'react';
import { LearningItem } from '@/lib/types';
import { ArrowLeft, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingGameProps {
    words: LearningItem[];
    onBack: () => void;
}

interface Card {
    id: number;
    content: string;
    type: 'word' | 'meaning';
    wordId: string;
    isMatched: boolean;
}

export function MatchingGame({ words, onBack }: MatchingGameProps) {
    const [items, setItems] = useState<Card[]>([]);
    const [selected, setSelected] = useState<Card | null>(null);
    const [matchedCount, setMatchedCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);

    useEffect(() => {
        if (!words.length) return;

        const shuffled = [...words]
            .sort(() => Math.random() - 0.5)
            .slice(0, 8); // Take 8 pairs

        const cardItems: Card[] = [];
        shuffled.forEach((word) => {
            // Word card
            cardItems.push({
                id: Math.random(),
                content: word.text,
                type: 'word',
                wordId: word.id,
                isMatched: false,
            });
            // Meaning card
            cardItems.push({
                id: Math.random(),
                content: word.meaning,
                type: 'meaning',
                wordId: word.id,
                isMatched: false,
            });
        });

        setItems(cardItems.sort(() => Math.random() - 0.5));
        setStartTime(Date.now());
    }, [words]);

    const handleCardClick = (card: Card) => {
        if (selected && selected.id === card.id) return;
        if (card.isMatched) return;

        if (!selected) {
            setSelected(card);
        } else {
            // Check match
            if (selected.wordId === card.wordId && selected.type !== card.type) {
                // Match!
                setItems(prev => prev.map(item =>
                    item.wordId === card.wordId ? { ...item, isMatched: true } : item
                ));
                setMatchedCount(prev => prev + 1);
                setSelected(null);
            } else {
                // Wrong
                setMistakes(prev => prev + 1);
                // Delay before clearing selection
                setTimeout(() => setSelected(null), 500);
            }
        }
    };

    if (matchedCount === 8 || (items.length > 0 && matchedCount === items.length / 2)) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl max-w-md w-full">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">게임 클리어!</h2>
                    <p className="text-gray-500 mb-8">모든 카드를 연결했습니다</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                            <p className="text-2xl font-bold text-red-500">{mistakes}</p>
                            <p className="text-xs text-gray-500">실수</p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                            <p className="text-2xl font-bold text-indigo-500">
                                {startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}s
                            </p>
                            <p className="text-xs text-gray-500">시간</p>
                        </div>
                    </div>

                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        목록으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex-none flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{mistakes} Mistakes</span>
                    </div>
                </div>
            </div>

            {/* Grid Area - Flex & Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-20 custom-scrollbar">
                <div className="grid grid-cols-4 gap-3 md:gap-4 h-full content-start">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            disabled={item.isMatched}
                            className={cn(
                                "aspect-square rounded-2xl p-2 md:p-4 flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-300 shadow-sm border-2",
                                item.isMatched
                                    ? "opacity-0 cursor-default"
                                    : "bg-white dark:bg-gray-900 hover:-translate-y-1 hover:shadow-md",
                                selected?.id === item.id
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 scale-105 z-10"
                                    : "border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                            )}
                        >
                            <span className="line-clamp-3 text-center break-keep">
                                {item.content}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
