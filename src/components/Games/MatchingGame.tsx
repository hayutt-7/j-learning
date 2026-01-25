'use client';

import { useState, useEffect } from 'react';
import { LearningHistoryItem } from '@/lib/types';
import { ArrowLeft, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useStudyLog } from '@/hooks/useStudyLog';

interface MatchingGameProps {
    words: LearningHistoryItem[];
    onBack: () => void;
}

interface MatchItem {
    id: string;
    text: string;
    pairId: string;
    type: 'word' | 'meaning';
    isMatched: boolean;
}

export function MatchingGame({ words, onBack }: MatchingGameProps) {
    const [items, setItems] = useState<MatchItem[]>([]);
    const [selected, setSelected] = useState<MatchItem | null>(null);
    const [matchedCount, setMatchedCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const dailyGoals = useDailyGoals();
    const studyLog = useStudyLog();

    const totalPairs = Math.min(6, words.length);

    // Initialize game
    useEffect(() => {
        const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, totalPairs);

        const wordItems: MatchItem[] = shuffled.map(w => ({
            id: `word-${w.itemId}`,
            text: w.text,
            pairId: w.itemId,
            type: 'word',
            isMatched: false,
        }));

        const meaningItems: MatchItem[] = shuffled.map(w => ({
            id: `meaning-${w.itemId}`,
            text: w.meaning,
            pairId: w.itemId,
            type: 'meaning',
            isMatched: false,
        }));

        // Shuffle separately for two columns
        setItems([
            ...wordItems.sort(() => Math.random() - 0.5),
            ...meaningItems.sort(() => Math.random() - 0.5),
        ]);
        setStartTime(Date.now());
    }, [words, totalPairs]);

    // Timer
    useEffect(() => {
        if (isFinished || startTime === 0) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 100);
        return () => clearInterval(interval);
    }, [startTime, isFinished]);

    const handleSelect = (item: MatchItem) => {
        if (item.isMatched) return;

        if (!selected) {
            setSelected(item);
        } else if (selected.id === item.id) {
            setSelected(null);
        } else if (selected.type === item.type) {
            // Same type, switch selection
            setSelected(item);
        } else {
            // Different type, check match
            if (selected.pairId === item.pairId) {
                // Correct match!
                setItems(prev => prev.map(i =>
                    i.pairId === item.pairId ? { ...i, isMatched: true } : i
                ));
                setMatchedCount(prev => prev + 1);

                if (matchedCount + 1 >= totalPairs) {
                    setIsFinished(true);
                    dailyGoals.addWords(totalPairs);
                    studyLog.logStudy({ wordsLearned: totalPairs });
                }
            } else {
                setMistakes(prev => prev + 1);
            }
            setSelected(null);
        }
    };

    const wordItems = items.filter(i => i.type === 'word');
    const meaningItems = items.filter(i => i.type === 'meaning');

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (isFinished) {
        return (
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">완료!</h2>
                    <p className="text-gray-500 mb-8">{totalPairs}개 매칭 성공</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatTime(elapsedTime)}</p>
                            <p className="text-xs text-gray-500">소요 시간</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-red-600 dark:text-red-400">{mistakes}</p>
                            <p className="text-xs text-gray-500">실수</p>
                        </div>
                    </div>

                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        게임 목록으로
                    </button>
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
                    <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold text-sm">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {matchedCount}/{totalPairs}
                        </span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="grid grid-cols-2 gap-3">
                {/* Words column */}
                <div className="space-y-2">
                    {wordItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            disabled={item.isMatched}
                            className={cn(
                                "w-full py-4 px-3 rounded-xl font-bold text-center transition-all duration-200 text-sm",
                                item.isMatched
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    : selected?.id === item.id
                                        ? "bg-indigo-600 text-white scale-105"
                                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                        >
                            {item.text}
                            {item.isMatched && <CheckCircle2 className="w-4 h-4 inline ml-1" />}
                        </button>
                    ))}
                </div>

                {/* Meanings column */}
                <div className="space-y-2">
                    {meaningItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            disabled={item.isMatched}
                            className={cn(
                                "w-full py-4 px-3 rounded-xl font-bold text-center transition-all duration-200 text-sm",
                                item.isMatched
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    : selected?.id === item.id
                                        ? "bg-purple-600 text-white scale-105"
                                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                        >
                            {item.text}
                            {item.isMatched && <CheckCircle2 className="w-4 h-4 inline ml-1" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
