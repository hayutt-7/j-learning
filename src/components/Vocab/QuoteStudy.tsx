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
        <div className="w-full h-full flex flex-col max-w-4xl mx-auto py-6 px-4">
            {/* Theme Selector (Fixed at top) */}
            <div className="flex-none flex flex-col items-center mb-6">
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
                                flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm
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

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-20 px-1 custom-scrollbar">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <div className="w-16 h-16 relative">
                            <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-500 font-medium animate-pulse">AI가 멋진 일본어 명언을 찾고 있어요...</p>
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
                    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Main Quote Paper/Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-100/50 dark:shadow-none relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80"></div>
                            <Quote className="absolute top-8 left-8 w-12 h-12 text-gray-100 dark:text-gray-800 rotate-180" />
                            <Quote className="absolute bottom-8 right-8 w-12 h-12 text-gray-100 dark:text-gray-800" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 mb-10 tracking-wider uppercase border border-gray-100 dark:border-gray-700">
                                    {THEMES.find(t => t.id === currentTheme)?.icon}
                                    {THEMES.find(t => t.id === currentTheme)?.label || 'Random'}
                                </span>

                                {/* Main Japanese Text */}
                                <div className="mb-10 w-full">
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 leading-relaxed">
                                        {quoteData.tokens && quoteData.tokens.length > 0 ? (
                                            quoteData.tokens.map((token, idx) => (
                                                <ruby key={idx} className="flex flex-col-reverse items-center group cursor-pointer transition-transform hover:scale-105"
                                                    onClick={() => playAudio(token.text)}
                                                    title="Click to listen"
                                                >
                                                    <span className="text-4xl md:text-6xl font-black tracking-wider font-serif text-gray-900 dark:text-white decoration-indigo-200/50 dark:decoration-indigo-900/50 underline-offset-8 group-hover:underline transition-all">
                                                        {token.text}
                                                    </span>
                                                    <rt className="text-sm md:text-lg font-medium text-indigo-500 dark:text-indigo-400 mb-2 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {token.reading}
                                                    </rt>
                                                </ruby>
                                            ))
                                        ) : (
                                            <h1 className="text-4xl md:text-5xl font-black tracking-wide font-serif text-gray-900 dark:text-white">
                                                {quoteData.items && quoteData.items[0]?.text}
                                            </h1>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-16 h-1 bg-indigo-500 rounded-full mb-10 opacity-20"></div>

                                {/* Translation */}
                                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium mb-12 leading-relaxed italic max-w-2xl">
                                    "{quoteData.translatedText}"
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap justify-center gap-4 w-full">
                                    <button
                                        onClick={() => {
                                            // Play full Japanese text
                                            const text = quoteData.items?.[0]?.text || "";
                                            if (text) playAudio(text);
                                        }}
                                        className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                                    >
                                        <Volume2 className="w-5 h-5" />
                                        전체 듣기
                                    </button>
                                    <button
                                        onClick={() => generateQuote(currentTheme)}
                                        className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        다음 명언
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Section Divider */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#FAFAFA] dark:bg-[#030712] px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Analysis
                                </span>
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="space-y-4 pb-10">
                            {quoteData.items && (
                                <AnalysisList items={quoteData.items} />
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State / Welcome */}
                {!isLoading && !quoteData && !error && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            오늘의 명언을 확인해보세요
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            위의 테마를 선택하면 AI가 엄선한 <span className="text-indigo-500 font-bold">일본어 명언</span>과 함께<br />
                            단어 분석 및 발음을 제공해드립니다.
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
        </div>
    );
}
