'use client';

import { useLearningHistory } from '@/hooks/useLearningHistory';
import { X, RotateCcw, Check, Brain, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LearningHistoryItem } from '@/lib/types';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const { getDueItems, reviewItem } = useLearningHistory();
    const [dueItems, setDueItems] = useState<LearningHistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Stats for this session
    const [stats, setStats] = useState({ reviewed: 0, correct: 0 });

    // Defined early to be used in effects
    const currentItem = dueItems[currentIndex];

    useEffect(() => {
        if (isOpen) {
            setDueItems(getDueItems());
            setCurrentIndex(0);
            setIsFlipped(false);
            setStats({ reviewed: 0, correct: 0 });
        }
    }, [isOpen, getDueItems]);

    // TTS Function
    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any current speaking
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9; // Slightly slower for clarity

            // Find a Japanese voice if available
            const voices = window.speechSynthesis.getVoices();
            const jpVoice = voices.find(v => v.lang.includes('ja'));
            if (jpVoice) utterance.voice = jpVoice;

            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Auto-play audio when a new card is shown (front side)
        if (!isFlipped && currentItem?.text) {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => {
                playAudio(currentItem.text);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentItem, isFlipped]);

    const handleAnswer = (quality: number) => {
        const currentItem = dueItems[currentIndex];
        reviewItem(currentItem.itemId, quality);

        setStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct
        }));

        if (currentIndex < dueItems.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished
            setDueItems([]); // Update state to show finished screen
        }
    };

    if (!isOpen) return null;

    const showFinished = dueItems.length === 0 && stats.reviewed > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        <span>오늘의 복습</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[320px]">
                    {showFinished ? (
                        <div className="text-center animate-in zoom-in-95 py-8">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">복습 완료!</h3>
                            <p className="text-gray-500 mb-8 max-w-[200px] mx-auto leading-relaxed">{stats.reviewed}개의 카드를 성공적으로 복습했습니다.</p>
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                수고하셨습니다!
                            </button>
                        </div>
                    ) : dueItems.length === 0 ? (
                        <div className="text-center text-gray-500">
                            <p className="text-lg font-medium mb-2">복습할 항목이 없습니다.</p>
                            <p className="text-sm">내일 다시 확인해주세요!</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            {/* Progress */}
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentIndex) / dueItems.length) * 100}%` }}
                                />
                            </div>

                            {/* Card */}
                            <div
                                className="flex-1 relative perspective-1000 cursor-pointer group"
                                onClick={() => {
                                    if (!isFlipped && currentItem?.text) playAudio(currentItem.text);
                                    setIsFlipped(!isFlipped);
                                }}
                            >
                                <div className={cn(
                                    "relative w-full h-full min-h-[280px] transition-all duration-500 preserve-3d",
                                    isFlipped ? "rotate-y-180" : ""
                                )}>
                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-between p-6">
                                        <div className="w-full flex justify-center">
                                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wide uppercase">
                                                {currentItem.type || 'Review'}
                                            </span>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                                            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 text-center leading-tight tracking-tight break-keep">
                                                {currentItem.text}
                                            </h3>
                                            {currentItem.jlpt && (
                                                <span className="mt-3 px-2 py-0.5 rounded border border-gray-200 text-gray-400 text-[10px] font-bold">
                                                    {currentItem.jlpt}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 font-medium animate-pulse mt-4">
                                            터치하여 정답/뜻 보기
                                        </p>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            {currentItem.reading && (
                                                <p className="text-lg text-indigo-500 font-medium mb-1">
                                                    {currentItem.reading}
                                                </p>
                                            )}
                                            <h3 className="text-3xl font-black text-gray-900 mb-4">{currentItem.text}</h3>

                                            <h3 className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">MEANING</h3>
                                            <p className="text-XL font-bold text-gray-700 break-keep leading-relaxed">
                                                {currentItem.meaning}
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-indigo-100 w-full flex justify-between items-center text-xs text-gray-500">
                                            <span>다음 배정일</span>
                                            <span className="font-bold text-indigo-600">
                                                {currentItem.interval === 0 ? '내일' : `${currentItem.interval}일 후`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {!showFinished && dueItems.length > 0 && (
                    <div className="p-4 bg-white border-t border-gray-100">
                        {isFlipped ? (
                            <div className="grid grid-cols-4 gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleAnswer(1); }} className="flex flex-col items-center justify-center gap-1 h-14 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                    <span className="font-bold text-xs">몰라요</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleAnswer(3); }} className="flex flex-col items-center justify-center gap-1 h-14 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                                    <span className="font-bold text-xs">어려움</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleAnswer(4); }} className="flex flex-col items-center justify-center gap-1 h-14 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                    <span className="font-bold text-xs">알맞음</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleAnswer(5); }} className="flex flex-col items-center justify-center gap-1 h-14 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                    <span className="font-bold text-xs">쉬움</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsFlipped(true)}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                            >
                                정답 보기
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
