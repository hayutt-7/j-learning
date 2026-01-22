'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { JLPTLevel, LearningItem } from '@/lib/types';
import { LevelSelector } from './LevelSelector';
import { VocabCard } from './VocabCard';
import { ArrowLeft, ChevronLeft, ChevronRight, Trophy, X, Zap, BookX, Flame } from 'lucide-react';
import { useUserProgress, XP_TABLE } from '@/hooks/useUserProgress';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { VOCAB_DATABASE } from '@/lib/vocabDatabase';

type CardStatus = 'know' | 'dont_know' | 'unseen';

interface SessionStats {
    totalXp: number;
    cardsStudied: number;
    correctCount: number;
    incorrectCount: number;
}

export function VocabStudy() {
    const [level, setLevel] = useState<JLPTLevel | null>(null);
    const [cards, setCards] = useState<LearningItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardStatuses, setCardStatuses] = useState<Map<string, CardStatus>>(new Map());
    const [sessionStats, setSessionStats] = useState<SessionStats>({ totalXp: 0, cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
    const [showExitModal, setShowExitModal] = useState(false);

    const { addXp, updateStreak } = useUserProgress();

    const currentItem = cards[currentIndex];

    const startSession = useCallback((selected: JLPTLevel) => {
        const pool = VOCAB_DATABASE[selected || 'N5'] || VOCAB_DATABASE['N5'];
        // Shuffle the pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setLevel(selected);
        setCurrentIndex(0);
        setCardStatuses(new Map());
        setSessionStats({ totalXp: 0, cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
    }, []);

    const handleResult = (result: 'know' | 'dont_know') => {
        if (!level || !currentItem) return;

        const isNew = !cardStatuses.has(currentItem.id);

        // Update status
        setCardStatuses(prev => new Map(prev).set(currentItem.id, result));

        if (isNew) {
            if (result === 'know') {
                const xp = XP_TABLE.VOCAB_CORRECT[level] || 10;
                addXp(xp);
                updateStreak();
                setSessionStats(prev => ({
                    ...prev,
                    totalXp: prev.totalXp + xp,
                    cardsStudied: prev.cardsStudied + 1,
                    correctCount: prev.correctCount + 1
                }));
            } else {
                setSessionStats(prev => ({
                    ...prev,
                    cardsStudied: prev.cardsStudied + 1,
                    incorrectCount: prev.incorrectCount + 1
                }));
            }
        }
    };

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleExit = () => {
        if (sessionStats.cardsStudied > 0) {
            setShowExitModal(true);
        } else {
            setLevel(null);
        }
    };

    const confirmExit = () => {
        setShowExitModal(false);
        setLevel(null);
    };

    const currentStatus = currentItem ? cardStatuses.get(currentItem.id) : undefined;

    if (!level) {
        return <LevelSelector onSelect={startSession} />;
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto h-full py-6">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-6 px-4">
                <button
                    onClick={handleExit}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-white px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm shadow-sm">
                        {level} 단어장
                    </span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {currentIndex + 1} / {cards.length}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                    <Zap className="w-5 h-5" />
                    <span>+{sessionStats.totalXp}</span>
                </div>
            </div>

            {/* Status Indicator */}
            {currentStatus && (
                <div className={`mb-4 px-4 py-2 rounded-full text-sm font-bold ${currentStatus === 'know' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                    {currentStatus === 'know' ? '✓ 알아요' : '✗ 몰라요'}
                </div>
            )}

            {/* Card */}
            {currentItem && (
                <VocabCard item={currentItem} onResult={handleResult} />
            )}

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    이전
                </button>
                <button
                    onClick={goNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                >
                    다음
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1 mt-6 overflow-x-auto max-w-full px-4">
                {cards.map((card, idx) => {
                    const status = cardStatuses.get(card.id);
                    return (
                        <button
                            key={card.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                ? 'bg-indigo-600 scale-125'
                                : status === 'know'
                                    ? 'bg-emerald-400'
                                    : status === 'dont_know'
                                        ? 'bg-red-400'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    );
                })}
            </div>

            {/* Exit Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-end">
                            <button onClick={() => setShowExitModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">학습 완료!</h3>
                            <div className="grid grid-cols-2 gap-4 my-6 text-center">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-3xl font-black text-indigo-600">+{sessionStats.totalXp}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">획득 XP</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{sessionStats.cardsStudied}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">학습 단어</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                    <p className="text-3xl font-black text-emerald-600">{sessionStats.correctCount}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">알아요</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                    <p className="text-3xl font-black text-red-500">{sessionStats.incorrectCount}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">몰라요</p>
                                </div>
                            </div>
                            <button
                                onClick={confirmExit}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
