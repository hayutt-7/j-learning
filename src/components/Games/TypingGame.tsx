'use client';

import { useState, useEffect, useRef } from 'react';
import { LearningItem } from '@/lib/types';
import { ArrowLeft, Clock, Keyboard, Trophy } from 'lucide-react';

interface TypingGameProps {
    words: LearningItem[];
    onBack: () => void;
}

export function TypingGame({ words, onBack }: TypingGameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isFinished, setIsFinished] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Filter valid words (must have text)
    const gameWords = words.filter(w => w.text && w.text.length > 0);
    const currentWord = gameWords[currentIndex];

    // Timer logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && isActive) {
            setIsFinished(true);
            setIsActive(false);
        }
    }, [isActive, timeLeft]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isActive) setIsActive(true);

        // Check answer (fuzzy matching possible, but simple for now exact match)
        if (input.trim() === currentWord.text) {
            setScore(prev => prev + 10);
            setInput('');
            // Next word
            setCurrentIndex(prev => (prev + 1) % gameWords.length);
        } else {
            // Wrong feedback could be added here
            setInput('');
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl max-w-md w-full">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">게임 종료!</h2>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">{score}점</p>
                    <button onClick={onBack} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl">목록으로</button>
                </div>
            </div>
        );
    }

    // No words check
    if (!currentWord) return <div className="p-8 text-center text-gray-500">학습할 단어가 부족합니다.</div>;

    return (
        <div className="flex flex-col h-full max-w-md mx-auto px-4 py-8">
            <div className="flex-none flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-600">{timeLeft}s</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto">
                <div className="w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl text-center mb-8">
                    <p className="text-lg text-gray-500 mb-2 font-medium">{currentWord.meaning}</p>
                    <div className="h-16 flex items-center justify-center">
                        <p className="text-4xl font-black text-gray-900 dark:text-white">?</p>
                    </div>
                    {currentWord.reading && <p className="text-sm text-gray-400 mt-4">{currentWord.reading}</p>}
                </div>

                <form onSubmit={handleSubmit} className="w-full relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Keyboard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="일본어를 입력하세요"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg font-bold focus:border-indigo-500 focus:outline-none transition-colors"
                        autoFocus
                    />
                </form>
            </div>
        </div>
    );
}
