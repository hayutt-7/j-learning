'use client';

import { useLearningHistory } from '@/hooks/useLearningHistory';
import { X, Volume2, Trophy, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LearningHistoryItem } from '@/lib/types';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const { getDueItems, reviewItem } = useLearningHistory();
    const [dueItems, setDueItems] = useState<LearningHistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [stats, setStats] = useState({ reviewed: 0, correct: 0 });

    const currentItem = dueItems[currentIndex];

    useEffect(() => {
        if (isOpen) {
            setDueItems(getDueItems());
            setCurrentIndex(0);
            setShowAnswer(false);
            setStats({ reviewed: 0, correct: 0 });
        }
    }, [isOpen, getDueItems]);

    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        if (!showAnswer && currentItem?.text) {
            const timer = setTimeout(() => playAudio(currentItem.text as string), 400);
            return () => clearTimeout(timer);
        }
    }, [currentItem, showAnswer]);

    const handleAnswer = (quality: number) => {
        if (!currentItem) return;
        reviewItem(currentItem.itemId, quality);
        setStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct
        }));

        if (currentIndex < dueItems.length - 1) {
            setShowAnswer(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setDueItems([]);
        }
    };

    if (!isOpen) return null;

    const isFinished = dueItems.length === 0 && stats.reviewed > 0;
    const isEmpty = dueItems.length === 0 && stats.reviewed === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">오늘의 복습</span>
                        {dueItems.length > 0 && (
                            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                {currentIndex + 1} / {dueItems.length}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[350px] flex flex-col items-center justify-center">
                    {isFinished ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">복습 완료!</h3>
                            <p className="text-gray-500 mb-6">{stats.reviewed}개 카드 학습 완료</p>
                            <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
                                닫기
                            </button>
                        </div>
                    ) : isEmpty ? (
                        <div className="text-center text-gray-500 py-10">
                            <p className="text-lg font-medium mb-2">복습할 항목이 없습니다.</p>
                            <p className="text-sm">계속 학습하면 복습 대상이 생깁니다!</p>
                        </div>
                    ) : currentItem && (
                        <div className="w-full flex flex-col items-center">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full mb-8">
                                <div
                                    className="bg-indigo-500 h-1 rounded-full transition-all"
                                    style={{ width: `${((currentIndex) / dueItems.length) * 100}%` }}
                                />
                            </div>

                            {/* Card Display */}
                            {!showAnswer ? (
                                /* Question Side */
                                <div className="w-full text-center">
                                    <div className="mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {currentItem.type === 'grammar' ? '문법' : '단어'}
                                        </span>
                                    </div>

                                    <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight break-keep">
                                        {currentItem.text}
                                    </h2>

                                    <button
                                        onClick={() => currentItem.text && playAudio(currentItem.text)}
                                        className="mx-auto mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 transition-colors"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                        <span className="text-sm font-medium">다시 듣기</span>
                                    </button>

                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        정답 보기
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                /* Answer Side */
                                <div className="w-full text-center">
                                    {currentItem.reading && (
                                        <p className="text-xl text-indigo-500 font-bold mb-1">{currentItem.reading}</p>
                                    )}
                                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                                        {currentItem.text}
                                    </h2>
                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-8 break-keep">
                                        {currentItem.meaning}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleAnswer(1)}
                                            className="py-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            몰라요
                                        </button>
                                        <button
                                            onClick={() => handleAnswer(5)}
                                            className="py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
                                        >
                                            알아요!
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
