'use client';

import { useState, useEffect, useCallback } from 'react';
import { LearningItem } from '@/lib/types';
import { ArrowLeft, Trophy, Zap, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useStudyLog } from '@/hooks/useStudyLog';

interface QuizGameProps {
    words: LearningItem[];
    onBack: () => void;
}

interface Question {
    word: LearningItem;
    options: string[];
    correctIndex: number;
}

export function QuizGame({ words, onBack }: QuizGameProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const dailyGoals = useDailyGoals();
    const studyLog = useStudyLog();

    // Generate questions
    useEffect(() => {
        if (words.length === 0) return;

        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const gameWords = shuffled.slice(0, Math.min(10, shuffled.length));

        const generated = gameWords.map((word) => {
            // Get 3 wrong answers from other words
            const otherWords = words.filter(w => w.id !== word.id);
            const wrongAnswers = otherWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.meaning);

            const options = [...wrongAnswers, word.meaning].sort(() => Math.random() - 0.5);

            return {
                word,
                options,
                correctIndex: options.indexOf(word.meaning)
            };
        });

        setQuestions(generated);
    }, [words]);

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return; // Already answered

        setSelectedIndex(index);
        const correct = index === questions[currentIndex].correctIndex;
        setIsCorrect(correct);

        if (correct) {
            const comboBonus = Math.min(combo, 5);
            const points = 10 + comboBonus * 2;
            setScore(prev => prev + points);
            setCombo(prev => prev + 1);
            setMaxCombo(prev => Math.max(prev, combo + 1));
        } else {
            setCombo(0);
        }

        // Auto advance after delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedIndex(null);
                setIsCorrect(null);
            } else {
                // Game finished
                setIsFinished(true);
                dailyGoals.addWords(questions.length);
                studyLog.logStudy({ wordsLearned: questions.length });
            }
        }, 800);
    };

    if (questions.length === 0) {
        return (
            <div className="max-w-md mx-auto py-12 px-4 text-center">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    if (isFinished) {
        const accuracy = Math.round((score / (questions.length * 10)) * 100);
        return (
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">게임 완료!</h2>
                    <p className="text-gray-500 mb-8">{questions.length}개 문제 도전</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}</p>
                            <p className="text-xs text-gray-500">점수</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</p>
                            <p className="text-xs text-gray-500">정확도</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{maxCombo}</p>
                            <p className="text-xs text-gray-500">최대 콤보</p>
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

    const currentQuestion = questions[currentIndex];

    return (
        <div className="max-w-md mx-auto py-8 px-4 pb-40 lg:pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold text-sm">{combo}x</span>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}점</span>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl mb-6 text-center">
                <p className="text-xs text-gray-400 mb-2">
                    {currentIndex + 1} / {questions.length}
                </p>
                {currentQuestion.word.reading && (
                    <p className="text-lg text-indigo-500 font-bold mb-1">{currentQuestion.word.reading}</p>
                )}
                <h2 className="text-4xl font-black text-gray-900 dark:text-white">
                    {currentQuestion.word.text}
                </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrectOption = idx === currentQuestion.correctIndex;

                    let bgClass = "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700";
                    if (selectedIndex !== null) {
                        if (isCorrectOption) {
                            bgClass = "bg-emerald-500 text-white border-emerald-500";
                        } else if (isSelected && !isCorrect) {
                            bgClass = "bg-red-500 text-white border-red-500";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            disabled={selectedIndex !== null}
                            className={cn(
                                "w-full py-4 px-6 rounded-xl font-bold text-left transition-all duration-200",
                                bgClass,
                                selectedIndex === null && "hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {selectedIndex !== null && isCorrectOption && (
                                    <Check className="w-5 h-5" />
                                )}
                                {selectedIndex !== null && isSelected && !isCorrect && (
                                    <X className="w-5 h-5" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
