'use client';

import { useState } from 'react';
import { Search, Loader2, Book, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playAudio } from '@/lib/audio-utils';

interface JishoData {
    slug: string;
    is_common: boolean;
    japanese: {
        word?: string;
        reading?: string;
    }[];
    senses: {
        english_definitions: string[];
        parts_of_speech: string[];
    }[];
    jlpt: string[];
}

export function DictionaryStudy() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<JishoData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!keyword.trim()) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);
        setResults([]); // Clear previous results while loading

        try {
            const res = await fetch(`/api/jisho?keyword=${encodeURIComponent(keyword)}`);
            if (!res.ok) throw new Error('Failed to fetch data');

            const data = await res.json();
            setResults(data.data || []);
        } catch (err) {
            console.error(err);
            setError('검색 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const playPronunciation = (text: string) => {
        playAudio(text, 'ja-JP');
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 pb-32">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200 dark:shadow-none">
                    <Book className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">일본어 사전</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    궁금한 단어를 검색해보세요. <br />
                    <span className="text-xs text-gray-400 mt-1 block">Powered by Jisho.org</span>
                </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto mb-12">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="단어를 입력하세요 (예: 水, water)"
                    className="w-full pl-6 pr-14 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-lg shadow-lg shadow-gray-100 dark:shadow-none focus:outline-none focus:border-teal-500 transition-colors"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="absolute right-3 top-3 p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                </button>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {error && (
                    <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {hasSearched && !isLoading && results.length === 0 && !error && (
                    <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-gray-500">
                        검색 결과가 없습니다.
                    </div>
                )}

                {results.map((item, idx) => {
                    const mainWord = item.japanese[0]?.word || item.japanese[0]?.reading || item.slug;
                    const reading = item.japanese[0]?.reading;
                    const isCommon = item.is_common;

                    return (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                            {mainWord}
                                        </h3>
                                        {reading && reading !== mainWord && (
                                            <span className="text-lg text-gray-500 font-medium">
                                                {reading}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => playPronunciation(mainWord)}
                                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-teal-500 transition-colors"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {isCommon && (
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">
                                                Common
                                            </span>
                                        )}
                                        {item.jlpt?.map((level, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-md">
                                                {level.replace('jlpt-', 'JLPT ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {item.senses.map((sense, sIdx) => (
                                    <div key={sIdx} className="text-gray-700 dark:text-gray-300">
                                        <div className="flex items-start gap-2">
                                            <span className="text-gray-400 text-sm font-medium min-w-[1.5rem] mt-0.5">{sIdx + 1}.</span>
                                            <div>
                                                <div className="text-sm text-gray-500 mb-0.5 italic">
                                                    {sense.parts_of_speech.join(', ')}
                                                </div>
                                                <div className="leading-relaxed">
                                                    {sense.english_definitions.join('; ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
