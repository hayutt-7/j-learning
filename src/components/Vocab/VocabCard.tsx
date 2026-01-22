'use client';

import { useState, useRef, useEffect } from 'react';
import { LearningItem } from '@/lib/types';
import { Volume2, Check, X } from 'lucide-react';

interface VocabCardProps {
    item: LearningItem;
    onResult: (result: 'know' | 'dont_know') => void;
}

export function VocabCard({ item, onResult }: VocabCardProps) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const touchStartX = useRef(0);

    // Reset when item changes
    useEffect(() => {
        setShowAnswer(false);
        setSwipeOffset(0);
    }, [item.id]);

    const playAudio = (text: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!showAnswer) return;
        const diff = e.touches[0].clientX - touchStartX.current;
        setSwipeOffset(diff);
        if (diff > 50) setSwipeDirection('right');
        else if (diff < -50) setSwipeDirection('left');
        else setSwipeDirection(null);
    };

    const handleTouchEnd = () => {
        if (swipeOffset > 100) {
            onResult('know');
        } else if (swipeOffset < -100) {
            onResult('dont_know');
        }
        setSwipeOffset(0);
        setSwipeDirection(null);
    };

    return (
        <div
            className="w-full max-w-sm mx-auto select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Swipe overlays */}
            {swipeDirection === 'right' && (
                <div className="fixed inset-0 bg-emerald-500/30 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 shadow-2xl">
                        <Check className="w-8 h-8" /> 알아요!
                    </div>
                </div>
            )}
            {swipeDirection === 'left' && (
                <div className="fixed inset-0 bg-red-500/30 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 shadow-2xl">
                        <X className="w-8 h-8" /> 몰라요
                    </div>
                </div>
            )}

            <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden transition-transform duration-200"
                style={{ transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.02}deg)` }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {item.jlpt || 'N5'}
                    </span>
                    <button
                        onClick={(e) => playAudio(item.text, e)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                        <Volume2 className="w-6 h-6" />
                    </button>
                </div>

                {/* Card Body */}
                <div
                    className="p-8 min-h-[350px] flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => !showAnswer && setShowAnswer(true)}
                >
                    {!showAnswer ? (
                        /* Question Side */
                        <div className="text-center w-full">
                            <h2 className="text-6xl font-black text-gray-900 dark:text-white leading-tight break-keep">
                                {item.text}
                            </h2>
                        </div>
                    ) : (
                        /* Answer Side */
                        <div className="text-center w-full animate-in fade-in duration-300">
                            {item.reading && (
                                <p className="text-2xl text-indigo-500 font-bold mb-2">{item.reading}</p>
                            )}
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                                {item.text}
                            </h2>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 break-keep mb-4">
                                {item.meaning}
                            </p>
                            {item.example && (
                                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-left">
                                    <p className="text-xs text-indigo-500 font-bold mb-1">예문</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium break-keep">{item.example}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {showAnswer && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 animate-in slide-in-from-bottom duration-300">
                        <button
                            onClick={() => onResult('dont_know')}
                            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                            <span>몰라요</span>
                        </button>
                        <button
                            onClick={() => onResult('know')}
                            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            <Check className="w-5 h-5" />
                            <span>알아요</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
