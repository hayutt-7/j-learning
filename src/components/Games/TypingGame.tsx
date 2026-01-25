'use client';

import { useState, useEffect, useRef } from 'react';
import { LearningHistoryItem } from '@/lib/types';
import { ArrowLeft, Trophy, Timer, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useStudyLog } from '@/hooks/useStudyLog';

interface TypingGameProps {
    words: LearningHistoryItem[];
    onBack: () => void;
}

export function TypingGame({ words, onBack }: TypingGameProps) {
    const [gameWords, setGameWords] = useState<LearningHistoryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const dailyGoals = useDailyGoals();
    const studyLog = useStudyLog();

    // Initialize
    useEffect(() => {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setGameWords(shuffled);
        inputRef.current?.focus();
    }, [words]);

    // Timer
    useEffect(() => {
        if (isFinished || timeLeft <= 0) {
            if (timeLeft <= 0) {
                setIsFinished(true);
                dailyGoals.addWords(correctCount);
                studyLog.logStudy({ wordsLearned: correctCount });
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished, correctCount, dailyGoals, studyLog]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWord || isFinished) return;

        const trimmedInput = input.trim().toLowerCase();
        const correctAnswer = currentWord.meaning.toLowerCase();

        // Check if answer is correct (allow partial match)
        const isCorrect = correctAnswer.includes(trimmedInput) && trimmedInput.length >= 2;

        if (isCorrect) {
            setFeedback('correct');
            setScore(prev => prev + Math.max(10, 20 - (60 - timeLeft)));
            setCorrectCount(prev => prev + 1);
        } else {
            setFeedback('wrong');
            setWrongCount(prev => prev + 1);
        }

        setTimeout(() => {
            setFeedback(null);
            setInput('');
            if (currentIndex < gameWords.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsFinished(true);
                dailyGoals.addWords(correctCount + (isCorrect ? 1 : 0));
                studyLog.logStudy({ wordsLearned: correctCount + (isCorrect ? 1 : 0) });
            }
            inputRef.current?.focus();
        }, 500);
    };

    const handleSkip = () => {
        setWrongCount(prev => prev + 1);
        setInput('');
        if (currentIndex < gameWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const currentWord = gameWords[currentIndex];

    if (isFinished) {
        return (
            <div className="max-w-md mx-auto py-12 px-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">시간 종료!</h2>
                    <p className="text-gray-500 mb-8">타이핑 챌린지 완료</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}</p>
                            <p className="text-xs text-gray-500">점수</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{correctCount}</p>
                            <p className="text-xs text-gray-500">정답</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                            <p className="text-2xl font-black text-red-600 dark:text-red-400">{wrongCount}</p>
                            <p className="text-xs text-gray-500">오답</p>
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

    if (!currentWord) {
        return (
            <div className="max-w-md mx-auto py-12 px-4 text-center">
                <p className="text-gray-500">로딩 중...</p>
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
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full font-bold",
                        timeLeft <= 10 ? "bg-red-100 text-red-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}>
                        <Timer className="w-4 h-4" />
                        <span>{timeLeft}초</span>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}점</span>
                    </div>
                </div>
            </div>

            {/* Word Card */}
            <div className={cn(
                "bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl mb-6 text-center transition-colors",
                feedback === 'correct' && "bg-emerald-50 dark:bg-emerald-900/30",
                feedback === 'wrong' && "bg-red-50 dark:bg-red-900/30"
            )}>
                <p className="text-sm text-gray-400 mb-2">뜻을 입력하세요</p>
                {currentWord.reading && (
                    <p className="text-lg text-indigo-500 font-bold mb-1">{currentWord.reading}</p>
                )}
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
                    {currentWord.text}
                </h2>

                {feedback && (
                    <div className={cn(
                        "flex items-center justify-center gap-2 font-bold",
                        feedback === 'correct' ? "text-emerald-600" : "text-red-600"
                    )}>
                        {feedback === 'correct' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {feedback === 'correct' ? '정답!' : `오답 (${currentWord.meaning})`}
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="뜻을 입력하세요..."
                    disabled={feedback !== null}
                    className="w-full px-6 py-4 text-lg font-bold text-center rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        모르겠어요
                    </button>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                    >
                        확인
                    </button>
                </div>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-1 text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="font-bold">{correctCount}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="font-bold">{wrongCount}</span>
                </div>
            </div>
        </div>
    );
}
