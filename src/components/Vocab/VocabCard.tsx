'use client';

import { useState, useRef, useEffect } from 'react';
import { LearningItem } from '@/lib/types';
import { Volume2, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VocabCardProps {
    item: LearningItem;
    onResult: (result: 'know' | 'dont_know') => void;
    showReading?: boolean;
}

export function VocabCard({ item, onResult, showReading = true }: VocabCardProps) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [generatedExample, setGeneratedExample] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const touchStartX = useRef(0);

    // Reset when item changes
    useEffect(() => {
        setShowAnswer(false);
        setSwipeOffset(0);
        setGeneratedExample('');
        setIsGenerating(false);
    }, [item.id]);

    const generateExample = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/example', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: item.text, meaning: item.meaning }),
            });
            const data = await res.json();
            if (data.sentence) {
                setGeneratedExample(data.sentence);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

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
        setSwipeOffset(Math.max(-150, Math.min(150, diff))); // Clamp
    };

    const handleTouchEnd = () => {
        if (swipeOffset > 80) {
            onResult('know');
        } else if (swipeOffset < -80) {
            onResult('dont_know');
        }
        setSwipeOffset(0);
    };

    // Determine border color based on swipe direction
    const getBorderClass = () => {
        if (swipeOffset > 50) return 'border-emerald-400 shadow-emerald-200 dark:shadow-emerald-900/50';
        if (swipeOffset < -50) return 'border-red-400 shadow-red-200 dark:shadow-red-900/50';
        return 'border-gray-100 dark:border-gray-700';
    };

    // Auto-play audio when answer is revealed
    useEffect(() => {
        if (showAnswer && item.text) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(item.text);
                    utterance.lang = 'ja-JP';
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [showAnswer, item.text]);

    // Haptic feedback helper
    const vibrate = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    };

    const handleAnswer = (result: 'know' | 'dont_know') => {
        vibrate();
        onResult(result);
    };

    return (
        <div
            className="w-full max-w-sm mx-auto select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className={cn(
                    "bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 overflow-hidden transition-all duration-200",
                    getBorderClass()
                )}
                style={{ transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.03}deg)` }}
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
                    className="p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => !showAnswer && setShowAnswer(true)}
                >
                    {!showAnswer ? (
                        <h2 className="text-6xl font-black text-gray-900 dark:text-white leading-tight break-keep text-center">
                            {item.text}
                        </h2>
                    ) : (
                        <div className="text-center w-full animate-in fade-in duration-200">
                            {showReading && item.reading && (
                                <p className="text-2xl text-indigo-500 font-bold mb-2">{item.reading}</p>
                            )}
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                                {item.text}
                            </h2>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 break-keep">
                                {item.meaning}
                            </p>
                            {item.example ? (
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-left">
                                    <p className="text-xs text-gray-400 font-bold mb-1">예문</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.example}</p>
                                </div>
                            ) : (
                                <div className="mt-6">
                                    {generatedExample ? (
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-left animate-in fade-in zoom-in-95 duration-200">
                                            <p className="text-xs text-indigo-400 font-bold mb-1 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> AI 예문
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{generatedExample}</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                generateExample();
                                            }}
                                            disabled={isGenerating}
                                            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                            {isGenerating ? 'AI가 예문 만드는 중...' : 'AI 예문 생성하기'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons - O / X only */}
                {showAnswer && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-4 animate-in fade-in duration-200">
                        <button
                            onClick={() => handleAnswer('dont_know')}
                            className="flex-1 flex items-center justify-center py-5 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95"
                        >
                            <X className="w-8 h-8" strokeWidth={3} />
                        </button>
                        <button
                            onClick={() => handleAnswer('know')}
                            className="flex-1 flex items-center justify-center py-5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all active:scale-95"
                        >
                            <Check className="w-8 h-8" strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
