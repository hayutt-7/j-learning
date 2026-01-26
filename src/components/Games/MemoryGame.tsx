'use client';

import { useState, useEffect } from 'react';
import { LearningItem } from '@/lib/types';
import { ArrowLeft, Grid3X3, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryGameProps {
    words: LearningItem[];
    onBack: () => void;
}

interface MemoryCard {
    id: number;
    content: string;
    type: 'word' | 'meaning';
    wordId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export function MemoryGame({ words, onBack }: MemoryGameProps) {
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flipped, setFlipped] = useState<MemoryCard[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);

    useEffect(() => {
        if (!words.length) return;
        // Take 6 pairs (12 cards) for 3x4 grid
        const gameWords = [...words].sort(() => Math.random() - 0.5).slice(0, 6);

        const newCards: MemoryCard[] = [];
        gameWords.forEach(w => {
            newCards.push({ id: Math.random(), content: w.text, type: 'word', wordId: w.id, isFlipped: false, isMatched: false });
            newCards.push({ id: Math.random(), content: w.meaning, type: 'meaning', wordId: w.id, isFlipped: false, isMatched: false });
        });

        setCards(newCards.sort(() => Math.random() - 0.5));
    }, [words]);

    const handleCardClick = (card: MemoryCard) => {
        if (flipped.length >= 2 || card.isFlipped || card.isMatched) return;

        // Flip card
        const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            // Check match
            const [c1, c2] = newFlipped;
            if (c1.wordId === c2.wordId && c1.type !== c2.type) {
                // Match
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.wordId === c1.wordId ? { ...c, isMatched: true } : c
                    ));
                    setFlipped([]);
                    setMatchedCount(prev => prev + 1);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === c1.id || c.id === c2.id ? { ...c, isFlipped: false } : c
                    ));
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    if (matchedCount === 6 && cards.length > 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl max-w-md w-full">
                    <Trophy className="w-16 h-16 text-pink-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">훌륭해요!</h2>
                    <p className="text-gray-500 mb-8">기억력이 정말 좋으시네요!</p>
                    <button onClick={onBack} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl">목록으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-8">
            <div className="flex-none flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="bg-pink-50 dark:bg-pink-900/20 px-4 py-2 rounded-full">
                    <span className="font-bold text-pink-600">{matchedCount} / 6 Pairs</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pb-20 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4 auto-rows-fr h-full">
                    {cards.map(card => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                            className={cn(
                                "relative aspect-[3/4] cursor-pointer perspective-1000",
                                card.isMatched && "opacity-0 pointer-events-none transition-opacity duration-500"
                            )}
                        >
                            <div className={cn(
                                "w-full h-full transition-all duration-500 transform-style-3d relative",
                                card.isFlipped ? "rotate-y-180" : ""
                            )}>
                                {/* Front (Hidden) */}
                                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900 rounded-2xl border-4 border-white dark:border-gray-800 backface-hidden flex items-center justify-center">
                                    <Grid3X3 className="w-8 h-8 text-indigo-300" />
                                </div>
                                {/* Back (Revealed) */}
                                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 backface-hidden rotate-y-180 flex items-center justify-center p-2 text-center shadow-lg">
                                    <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base break-keep">
                                        {card.content}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
