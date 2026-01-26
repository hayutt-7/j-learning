'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/lib/types';
import { RefreshCw, Sparkles, BookOpen, Quote, Volume2 } from 'lucide-react';
import { AnalysisList } from '@/components/Learning/AnalysisList';
import { playAudio } from '@/lib/audio-utils';

const THEMES = [
    { id: 'Random', label: '랜덤', icon: '🎲' },
    { id: 'Life', label: '인생', icon: '🌱' },
    { id: 'Success', label: '성공/노력', icon: '🔥' },
    { id: 'Love', label: '사랑', icon: '❤️' },
    { id: 'Study', label: '공부', icon: '📚' },
];

export function QuoteStudy() {
    const [currentTheme, setCurrentTheme] = useState('Random');
    const [quoteData, setQuoteData] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateQuote = async (theme: string) => {
        setIsLoading(true);
        setError(null);
        setCurrentTheme(theme);

        try {
            const response = await fetch('/api/generate-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme }),
            });

            if (!response.ok) throw new Error('Failed to generate quote');

            const data = await response.json();
            setQuoteData(data);

            // Auto play audio when quote is generated
            if (data.items && data.items.length > 0) {
                // Find the main quote item
                const quoteItem = data.items.find((item: any) => item.type === 'quote') || data.items[0];
                // Optional: playAudio(quoteItem.text);
            }

        } catch (err) {
            console.error(err);
            setError('명언을 불러오는데 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load? No, let user choose first.

    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-4">
            {/* Theme Selector */}
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                    <Quote className="w-6 h-6 text-indigo-500" />
                    오늘의 일본어 명언
                </h2>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => generateQuote(theme.id)}
                            disabled={isLoading}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all
                                ${currentTheme === theme.id && quoteData
                                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <span>{theme.icon}</span>
                            <span>{theme.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-500 font-medium animate-pulse">AI가 멋진 명언을 찾고 있어요...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => generateQuote(currentTheme)}
                        className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 border border-red-100 rounded-lg text-red-600 font-medium shadow-sm hover:bg-red-50"
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* Quote Display */}
            {!isLoading && quoteData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Quote Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>

                        <div className="relative z-10 text-center">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-6 border border-white/20">
                                {THEMES.find(t => t.id === currentTheme)?.label || 'Random'} Quote
                            </span>

                            {/* Main Japanese Text */}
                            <h1 className="text-3xl md:text-4xl font-black mb-6 leading-relaxed tracking-wide drop-shadow-sm font-serif">
                                {quoteData.items && quoteData.items[0]?.text}
                            </h1>

                            {/* Translation */}
                            <p className="text-lg md:text-xl text-indigo-100 font-medium mb-8 leading-relaxed">
                                "{quoteData.translatedText}"
                            </p>

                            {/* Actions */}
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        const text = quoteData.items?.[0]?.text || "";
                                        if (text) playAudio(text);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Volume2 className="w-5 h-5" />
                                    듣기
                                </button>
                                <button
                                    onClick={() => generateQuote(currentTheme)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700/50 hover:bg-indigo-700 text-white rounded-xl font-bold backdrop-blur-sm transition-all border border-indigo-400/30"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    다른 명언
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Section */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">상세 분석 & 단어 학습</h3>
                        </div>

                        {/* Use AnalysisList for vocabulary breakdown */}
                        {quoteData.items && (
                            <AnalysisList items={quoteData.items} />
                        )}
                    </div>
                </div>
            )}

            {/* Empty State / Welcome */}
            {!isLoading && !quoteData && !error && (
                <div className="text-center py-20 px-4">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        오늘의 명언을 확인해보세요
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        위의 테마를 선택하면 AI가 엄선한 일본어 명언과 함께<br />
                        자세한 단어/문법 분석을 제공해드립니다.
                    </p>
                    <button
                        onClick={() => generateQuote('Random')}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
                    >
                        🎲 랜덤 명언 뽑기
                    </button>
                </div>
            )}
        </div>
    );
}
