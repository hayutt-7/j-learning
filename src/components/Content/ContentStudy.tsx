'use client';

import { useState } from 'react';
import { FileText, Search, Loader2, ArrowLeft, BookOpen, Music, Video, ScrollText, CheckCircle2 } from 'lucide-react';
import { analyzeContent } from '@/app/actions';
import { AnalysisResult } from '@/lib/types';
import { ResultArea } from '../Translator/ResultArea';
import { AnalysisList } from '../Learning/AnalysisList';
import { cn } from '@/lib/utils';

export function ContentStudy() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult[] | null>(null);
    const [title, setTitle] = useState('');
    const [viewMode, setViewMode] = useState<'FOCUS' | 'LIST'>('FOCUS'); // Default to Focus (Carousel)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    // Search Mode State
    const [mode, setMode] = useState<'DIRECT' | 'SEARCH'>('DIRECT');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchTitle, setSearchTitle] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSongSearch = async () => {
        if (!searchArtist.trim() || !searchTitle.trim()) {
            setError('가수와 제목을 모두 입력해주세요.');
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const res = await fetch('/api/song', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artist: searchArtist, title: searchTitle }),
            });

            if (!res.ok) throw new Error('Search failed');

            const data = await res.json();
            if (data.sentences && data.sentences.length > 0) {
                // Formatting lyrics
                const lyrics = data.sentences.join('\n');
                setContent(lyrics);
                setTitle(`${data.artist} - ${data.title}`);
                setMode('DIRECT'); // Switch back to edit mode
            } else {
                setError('가사를 찾을 수 없습니다.');
            }
        } catch (err) {
            console.error(err);
            setError('검색 중 오류가 발생했습니다.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAnalyze = async () => {
        if (!content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await analyzeContent(content);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResults(null);
        setContent('');
        setTitle('');
        setError('');
    };

    if (results) {
        return (
            <div className="flex-none flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
                            {title || '콘텐츠 학습'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {results.length}개의 문장 분석 완료
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shrink-0">
                    <button
                        onClick={() => setViewMode('FOCUS')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'FOCUS' ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" : "text-gray-400"
                        )}
                        title="집중 모드 (하나씩 보기)"
                    >
                        <ScrollText className="w-4 h-4" /> {/* Focus Icon */}
                    </button>
                    <button
                        onClick={() => setViewMode('LIST')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'LIST' ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" : "text-gray-400"
                        )}
                        title="리스트 모드 (전체 보기)"
                    >
                        <FileText className="w-4 h-4" /> {/* List Icon */}
                    </button>
                </div>
            </div>

                {
            viewMode === 'FOCUS' ? (
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Focus/Carousel View */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-20">
                        {/* Navigation Bar */}
                        <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-black/95 backdrop-blur-sm pb-4 flex items-center justify-between mb-2">
                            <button
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-600 dark:text-gray-400"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                                {currentIndex + 1} <span className="text-gray-400 text-sm">/ {results.length}</span>
                            </span>
                            <button
                                onClick={() => setCurrentIndex(prev => Math.min(results.length - 1, prev + 1))}
                                disabled={currentIndex === results.length - 1}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 transition-all text-gray-600 dark:text-gray-400"
                            >
                                {currentIndex === results.length - 1 ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                ) : (
                                    <ArrowLeft className="w-6 h-6 rotate-180" />
                                )}
                            </button>
                        </div>

                        {/* Current Sentence Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-md animate-in fade-in slide-in-from-right-4 duration-300" key={currentIndex}>
                            <div className="mb-8">
                                <ResultArea result={results[currentIndex]} />
                                <p className="mt-4 text-gray-600 dark:text-gray-300 text-xl leading-relaxed font-medium text-center">
                                    {results[currentIndex].translatedText}
                                </p>
                            </div>

                            {results[currentIndex].items && results[currentIndex].items.length > 0 && (
                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <AnalysisList items={results[currentIndex].items} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pb-20 pl-4 pr-6 custom-scrollbar space-y-8"> {/* Increased left padding for indices */}
                {results.map((result, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                        <div className="absolute -left-3 top-6 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-white dark:border-gray-900 shadow-sm z-10">
                            {idx + 1}
                        </div>

                        <div className="mb-6 pl-4">
                            <ResultArea result={result} />
                            <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                                {result.translatedText}
                            </p>
                        </div>

                        {/* Analysis List */}
                        {result.items && result.items.length > 0 && (
                            <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                <AnalysisList items={result.items} />
                            </div>
                        )}
                    </div>
                ))}

                <div className="text-center pt-8 pb-4">
                    <button
                        onClick={handleReset}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        다른 콘텐츠 학습하기
                    </button>
                </div>
            </div>
        )
        }
            </div >
        );
    }

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6">
            <div className="flex-1 overflow-y-auto min-h-0 pb-20 pl-1 pr-6 custom-scrollbar">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ScrollText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">콘텐츠 학습</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        가사, 대본, 뉴스 등 일본어 텍스트를 입력하면<br />문장별로 상세하게 분석해드립니다.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div className="space-y-6">
                        {/* Mode Tabs */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setMode('DIRECT')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                                    mode === 'DIRECT'
                                        ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                직접 입력
                            </button>
                            <button
                                onClick={() => setMode('SEARCH')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                                    mode === 'SEARCH'
                                        ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                노래 검색 (AI)
                            </button>
                        </div>

                        {mode === 'SEARCH' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        가수 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={searchArtist}
                                        onChange={(e) => setSearchArtist(e.target.value)}
                                        placeholder="예: YOASOBI, 요네즈 켄시"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        노래 제목
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTitle}
                                        onChange={(e) => setSearchTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSongSearch()}
                                        placeholder="예: IDOL, Lemon"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={handleSongSearch}
                                    disabled={isSearching || !searchArtist.trim() || !searchTitle.trim()}
                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none mt-4"
                                >
                                    {isSearching ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            가사 찾는 중...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5" />
                                            가사 불러오기
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    AI가 가사를 자동으로 찾아 입력창에 채워줍니다.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        제목 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="예: 요아소비 - 아이돌"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        일본어 텍스트 <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="일본어 가사나 문장을 붙여넣으세요. (한국어 번역이나 발음이 섞여 있어도 AI가 일본어만 분석합니다!)"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors h-64 resize-none text-base leading-relaxed"
                                    />
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}


                        {(mode === 'DIRECT' || content) && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !content.trim()}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none text-lg mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        분석 중입니다...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        분석 시작하기
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-12 mb-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30 group">
                        <Music className="w-6 h-6 text-pink-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">J-POP 가사</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 group">
                        <Video className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">애니/드라마 대사</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 group">
                        <BookOpen className="w-6 h-6 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">뉴스/소설</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
