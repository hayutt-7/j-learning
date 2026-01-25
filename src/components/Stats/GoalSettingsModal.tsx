'use client';

import { useState } from 'react';
import { X, Target, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { cn } from '@/lib/utils';

interface GoalSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_WORDS = [10, 20, 30, 50];
const PRESET_MINUTES = [5, 10, 15, 30];
const PRESET_REVIEWS = [5, 10, 15, 20];

export function GoalSettingsModal({ isOpen, onClose }: GoalSettingsModalProps) {
    const { wordsGoal, minutesGoal, reviewsGoal, setGoals } = useDailyGoals();

    const [words, setWords] = useState(wordsGoal);
    const [minutes, setMinutes] = useState(minutesGoal);
    const [reviews, setReviews] = useState(reviewsGoal);
    const [customMode, setCustomMode] = useState({
        words: !PRESET_WORDS.includes(wordsGoal),
        minutes: !PRESET_MINUTES.includes(minutesGoal),
        reviews: !PRESET_REVIEWS.includes(reviewsGoal),
    });

    const handleSave = () => {
        setGoals(words, minutes, reviews);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">목표 설정</h2>
                            <p className="text-xs text-gray-500">나만의 학습 목표를 설정하세요</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                    {/* Words Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                일일 단어 목표
                            </label>
                            <button
                                onClick={() => setCustomMode(prev => ({ ...prev, words: !prev.words }))}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                            >
                                {customMode.words ? '프리셋 선택' : '직접 입력'}
                            </button>
                        </div>
                        {customMode.words ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={words}
                                    onChange={(e) => setWords(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-gray-900 dark:text-white text-center font-bold text-lg focus:border-indigo-500 focus:outline-none"
                                />
                                <span className="text-sm font-medium text-gray-500">개</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_WORDS.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setWords(val)}
                                        className={cn(
                                            "py-3 rounded-xl font-bold transition-all",
                                            words === val
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        {val}개
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Minutes Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-violet-500" />
                                일일 학습 시간
                            </label>
                            <button
                                onClick={() => setCustomMode(prev => ({ ...prev, minutes: !prev.minutes }))}
                                className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline"
                            >
                                {customMode.minutes ? '프리셋 선택' : '직접 입력'}
                            </button>
                        </div>
                        {customMode.minutes ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={minutes}
                                    onChange={(e) => setMinutes(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-gray-900 dark:text-white text-center font-bold text-lg focus:border-violet-500 focus:outline-none"
                                />
                                <span className="text-sm font-medium text-gray-500">분</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_MINUTES.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setMinutes(val)}
                                        className={cn(
                                            "py-3 rounded-xl font-bold transition-all",
                                            minutes === val
                                                ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        {val}분
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews Goal */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-purple-500" />
                                일일 복습 목표
                            </label>
                            <button
                                onClick={() => setCustomMode(prev => ({ ...prev, reviews: !prev.reviews }))}
                                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
                            >
                                {customMode.reviews ? '프리셋 선택' : '직접 입력'}
                            </button>
                        </div>
                        {customMode.reviews ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={reviews}
                                    onChange={(e) => setReviews(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-gray-900 dark:text-white text-center font-bold text-lg focus:border-purple-500 focus:outline-none"
                                />
                                <span className="text-sm font-medium text-gray-500">회</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_REVIEWS.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setReviews(val)}
                                        className={cn(
                                            "py-3 rounded-xl font-bold transition-all",
                                            reviews === val
                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        {val}회
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                    >
                        목표 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
