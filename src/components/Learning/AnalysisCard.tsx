'use client';

import { Check, BookOpen, ALargeSmall } from 'lucide-react';
import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AnalysisCardProps {
    item: LearningItem;
}

export function AnalysisCard({ item }: AnalysisCardProps) {
    const { toggleMastery, isMastered } = useLearningHistory();
    const mastered = isMastered(item.id);
    const [isExpanded, setIsExpanded] = useState(true);

    const Icon = item.type === 'grammar' ? BookOpen : ALargeSmall;

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border transition-all duration-300",
                mastered
                    ? "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60 dark:opacity-40"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md dark:shadow-none"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/20 border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        item.type === 'grammar'
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
                            {item.reading ? (
                                <ruby className="flex flex-col-reverse justify-center leading-none gap-0.5">
                                    <span className="text-lg leading-tight">{item.text}</span>
                                    <rt className="text-[10px] text-gray-400 dark:text-gray-500 font-normal select-none text-left">{item.reading}</rt>
                                </ruby>
                            ) : (
                                item.text
                            )}

                            {item.type === 'grammar' && (
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                                    문법
                                </span>
                            )}
                            {item.jlpt && (
                                <span className={cn(
                                    "text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border",
                                    item.jlpt === 'N1' ? "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900" :
                                        item.jlpt === 'N2' ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900" :
                                            item.jlpt === 'N3' ? "text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900" :
                                                "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900"
                                )}>
                                    {item.jlpt}
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{item.meaning}</p>
                    </div>
                </div>

                <button
                    onClick={() => toggleMastery(item.id)}
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full transition-all border-2",
                        mastered
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-400 dark:hover:text-indigo-400"
                    )}
                    title={mastered ? "암기 취소" : "암기 완료로 표시"}
                >
                    <Check className="w-5 h-5 stroke-[3]" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 pt-3">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {item.explanation}
                </p>

                {/* Tags / Metadata Grid */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {item.pitchAccent && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                            Accent: {item.pitchAccent}
                        </div>
                    )}
                </div>

                {item.nuance && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-100 dark:border-amber-900/50 text-sm">
                        <span className="font-bold text-amber-700 dark:text-amber-500 block mb-1 text-xs uppercase tracking-wide">뉘앙스</span>
                        <p className="text-amber-800 dark:text-amber-200">{item.nuance}</p>
                    </div>
                )}

                {item.examples && item.examples.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="font-bold text-gray-400 dark:text-gray-500 block mb-2 text-xs uppercase tracking-wide">예문</span>
                        <ul className="space-y-1.5">
                            {item.examples.map((ex, idx) => (
                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900">
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
