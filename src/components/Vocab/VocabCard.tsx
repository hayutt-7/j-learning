'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LearningItem } from '@/lib/types';
import { Volume2, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface VocabCardProps {
    item: LearningItem;
    onResult: (result: 'know' | 'dont_know') => void;
}

export function VocabCard({ item, onResult }: VocabCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const touchStartX = useRef(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const playAudio = (text: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isFlipped) return; // Only swipe when card is flipped
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
        setIsFlipped(false);
    };

    const handleFlip = () => {
        if (swipeOffset === 0) {
            setIsFlipped(!isFlipped);
        }
    };

    // Reset flip when item changes
    useState(() => {
        setIsFlipped(false);
    });

    return (
        <div
            className="w-full max-w-sm mx-auto h-[480px] perspective-1000 relative select-none"
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Swipe hint overlays */}
            {swipeDirection === 'right' && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2">
                        <Check className="w-6 h-6" /> 알아요!
                    </div>
                </div>
            )}
            {swipeDirection === 'left' && (
                <div className="absolute inset-0 bg-red-500/20 rounded-3xl z-10 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2">
                        <X className="w-6 h-6" /> 몰라요
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "relative w-full h-full transition-all preserve-3d cursor-pointer shadow-2xl rounded-3xl",
                    isFlipped ? "rotate-y-180" : "",
                    swipeOffset !== 0 ? "duration-0" : "duration-500"
                )}
                style={{ transform: `${isFlipped ? 'rotateY(180deg)' : ''} translateX(${swipeOffset}px) rotate(${swipeOffset * 0.02}deg)` }}
                onClick={handleFlip}
            >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 flex flex-col items-center justify-between border-2 border-gray-100 dark:border-gray-700">
                    <div className="w-full flex justify-between items-start">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {item.jlpt || 'N5'}
                        </span>
                        <button
                            onClick={(e) => playAudio(item.text, e)}
                            className="p-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h2 className="text-5xl font-black text-gray-900 dark:text-white text-center break-keep leading-tight mb-2">
                            {item.text}
                        </h2>
                        <p className="text-sm font-medium text-gray-400">터치하여 뒤집기</p>
                    </div>

                    <div className="w-full h-8" />
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl p-6 flex flex-col items-center justify-between border-2 border-indigo-100 dark:border-indigo-800 overflow-hidden">
                    {/* Swipe hints */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-300 dark:text-gray-600 opacity-50">
                        <ArrowLeft className="w-8 h-8" />
                    </div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-300 dark:text-gray-600 opacity-50">
                        <ArrowRight className="w-8 h-8" />
                    </div>

                    <div className="w-full flex justify-center pt-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">MEANING</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                        {item.reading && (
                            <p className="text-xl text-indigo-500 font-bold mb-1">{item.reading}</p>
                        )}
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                            {item.text}
                        </h2>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 break-keep mb-4">
                            {item.meaning}
                        </p>
                        {item.example && (
                            <div className="mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-100 dark:border-indigo-800 w-full">
                                <p className="text-xs text-indigo-400 font-bold mb-1">예문</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium break-keep">{item.example}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); onResult('dont_know'); }}
                            className="flex flex-col items-center justify-center py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 mb-0.5" />
                            <span className="text-xs font-bold">몰라요</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); onResult('know'); }}
                            className="flex flex-col items-center justify-center py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Check className="w-5 h-5 mb-0.5" />
                            <span className="text-xs font-bold">알아요</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
