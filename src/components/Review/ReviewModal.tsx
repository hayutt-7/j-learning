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

    useEffect(() => {
        if (isOpen) {
            setDueItems(getDueItems());
            setCurrentIndex(0);
            setIsFlipped(false);
            setStats({ reviewed: 0, correct: 0 });
        }
    }, [isOpen, getDueItems]);

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

    const currentItem = dueItems[currentIndex];
    const isFinished = dueItems.length > 0 && currentIndex >= dueItems.length; // Actually handled by logic above, but checking length
    const showFinished = dueItems.length === 0 && stats.reviewed > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {showFinished ? (
                        <div className="text-center animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">복습 완료!</h3>
                            <p className="text-gray-500 mb-6">{stats.reviewed}개의 항목을 복습했습니다.</p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentIndex) / dueItems.length) * 100}%` }}
                                />
                            </div>

                            {/* Card */}
                            <div
                                className="flex-1 relative perspective-1000 cursor-pointer group"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className={cn(
                                    "relative w-full h-full transition-all duration-500 preserve-3d",
                                    isFlipped ? "rotate-y-180" : ""
                                )}>
                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-50 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 hover:border-indigo-100 transition-colors">
                                        <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 mb-4">
                                            {currentItem.type || 'Review'}
                                        </span>
                                        <h3 className="text-3xl font-bold text-gray-900 text-center leading-tight">
                                            {currentItem.text}
                                        </h3>
                                        {currentItem.jlpt && (
                                            <span className="mt-4 px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-bold">
                                                {currentItem.jlpt}
                                            </span>
                                        )}
                                        <p className="mt-8 text-sm text-gray-400 font-medium animate-pulse">
                                            터치하여 뒤집기
                                        </p>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center p-8">
                                        <h3 className="text-xl font-medium text-gray-500 mb-2">뜻</h3>
                                        <p className="text-2xl font-bold text-indigo-900 text-center mb-6">
                                            {currentItem.meaning}
                                        </p>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-400 font-medium mb-1">복습 간격</div>
                                            <div className="text-lg font-bold text-gray-700">{currentItem.interval}일</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {!showFinished && dueItems.length > 0 && (
                    <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-4 gap-3">
                        {isFlipped ? (
                            <>
                                <button onClick={() => handleAnswer(1)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                                    <span className="font-bold text-sm">다시</span>
                                    <span className="text-[10px] opacity-60">1분</span>
                                </button>
                                <button onClick={() => handleAnswer(3)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-colors">
                                    <span className="font-bold text-sm">어려움</span>
                                    <span className="text-[10px] opacity-60">2일</span>
                                </button>
                                <button onClick={() => handleAnswer(4)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors">
                                    <span className="font-bold text-sm">알맞음</span>
                                    <span className="text-[10px] opacity-60">4일</span>
                                </button>
                                <button onClick={() => handleAnswer(5)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600 transition-colors">
                                    <span className="font-bold text-sm">쉬움</span>
                                    <span className="text-[10px] opacity-60">7일</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsFlipped(true)}
                                className="col-span-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
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
