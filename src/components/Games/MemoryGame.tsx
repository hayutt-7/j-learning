'use client';

import { useState, useEffect } from 'react';
import { LearningHistoryItem } from '@/lib/types';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useStudyLog } from '@/hooks/useStudyLog';

interface MemoryGameProps {
    words: LearningHistoryItem[];
    onBack: () => void;
}

interface Card {
    id: string;
    text: string;
    pairId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export function MemoryGame({ words, onBack }: MemoryGameProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<Card[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const dailyGoals = useDailyGoals();
    const studyLog = useStudyLog();

    const totalPairs = Math.min(6, words.length);

    // Initialize game
    useEffect(() => {
        const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, totalPairs);

        const wordCards: Card[] = shuffled.map(w => ({
            id: `word-${w.itemId}`,
            text: w.text || '',
            pairId: w.itemId,
            isFlipped: false,
            isMatched: false,
        }));

        const meaningCards: Card[] = shuffled.map(w => ({
            id: `meaning-${w.itemId}`,
            text: w.meaning || '',
            pairId: w.itemId,
            isFlipped: false,
            isMatched: false,
        }));

        const allCards = [...wordCards, ...meaningCards].sort(() => Math.random() - 0.5);
        setCards(allCards);
    }, [words, totalPairs]);

    const handleCardClick = (card: Card) => {
        if (isChecking || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

        const newFlipped = [...flippedCards, card];
        setFlippedCards(newFlipped);
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, isFlipped: true } : c));

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            setIsChecking(true);

            setTimeout(() => {
                const [first, second] = newFlipped;
                if (first.pairId === second.pairId) {
                    // Match!
                    setCards(prev => prev.map(c =>
                        c.pairId === first.pairId ? { ...c, isMatched: true } : c
                    ));
                    setMatchedPairs(prev => {
                        const newCount = prev + 1;
                        if (newCount >= totalPairs) {
                            setIsFinished(true);
                            dailyGoals.addWords(totalPairs);
                            studyLog.logStudy({ wordsLearned: totalPairs });
                        }
                        return newCount;
                    });
                } else {
                    // No match, flip back
                    setCards(prev => prev.map(c =>
                        c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
                    ));
                }
                setFlippedCards([]);
                setIsChecking(false);
            }, 800);
        }
    };

    const resetGame = () => {
        const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, totalPairs);

        const wordCards: Card[] = shuffled.map(w => ({
            id: `word-${w.itemId}`,
            text: w.text || '',
            pairId: w.itemId,
            isFlipped: false,
            isMatched: false,
        }));

        const meaningCards: Card[] = shuffled.map(w => ({
            id: `meaning-${w.itemId}`,
            text: w.meaning || '',
            pairId: w.itemId,
            isFlipped: false,
            isMatched: false,
        }));

        setCards([...wordCards, ...meaningCards].sort(() => Math.random() - 0.5));
        setMoves(0);
        setMatchedPairs(0);
        setFlippedCards([]);
        setIsFinished(false);
    };

    if (isFinished) {
        const stars = moves <= totalPairs * 2 ? 3 : moves <= totalPairs * 3 ? 2 : 1;
        return (
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">완벽해요!</h2>
                    <p className="text-gray-500 mb-4">{totalPairs}개 짝 모두 찾기</p>

                    <div className="flex justify-center gap-1 mb-8">
                        {[1, 2, 3].map(i => (
                            <span key={i} className={cn(
                                "text-3xl",
                                i <= stars ? "text-yellow-400" : "text-gray-300"
                            )}>★</span>
                        ))}
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-8">
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{moves}</p>
                        <p className="text-xs text-gray-500">시도 횟수</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={resetGame}
                            className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            다시 하기
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            게임 목록으로
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-8 px-4 pb-40 lg:pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <span className="font-bold text-gray-600 dark:text-gray-400">{moves} 시도</span>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {matchedPairs}/{totalPairs}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        disabled={card.isFlipped || card.isMatched}
                        className={cn(
                            "aspect-square rounded-xl font-bold text-sm transition-all duration-300 transform",
                            card.isMatched
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-95"
                                : card.isFlipped
                                    ? "bg-indigo-600 text-white rotate-y-180"
                                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-transparent hover:scale-105 cursor-pointer"
                        )}
                        style={{
                            perspective: '1000px',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div className="w-full h-full flex items-center justify-center p-2 break-keep leading-tight">
                            {(card.isFlipped || card.isMatched) ? card.text : '?'}
                        </div>
                    </button>
                ))}
            </div>

            {/* Tip */}
            <p className="text-center text-xs text-gray-400 mt-6">
                같은 짝을 찾아 카드를 뒤집어보세요!
            </p>
        </div>
    );
}
