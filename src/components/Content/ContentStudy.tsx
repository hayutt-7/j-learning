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
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

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
            <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6">
                <div className="flex-none flex items-center gap-4 mb-6">
                    <button
                        onClick={handleReset}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                            {title || '콘텐츠 학습'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {results.length}개의 문장 분석 완료
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pb-20 pl-1 pr-2 custom-scrollbar space-y-8">
                    {results.map((result, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                            <div className="absolute -left-3 top-6 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6">
            <div className="flex-1 overflow-y-auto min-h-0 pb-20 px-1 custom-scrollbar">
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
                                placeholder="분석하고 싶은 일본어 가사나 문장을 여기에 붙여넣으세요..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors h-64 resize-none text-base leading-relaxed"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !content.trim()}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none text-lg"
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
