'use client';

import { Check, BookOpen, ALargeSmall, Star } from 'lucide-react';
import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AnalysisCardProps {
    item: LearningItem;
}

export function AnalysisCard({ item }: AnalysisCardProps) {
    const { toggleMastery, toggleBookmark, isMastered, isBookmarked } = useLearningHistory();
    const mastered = isMastered(item.id);
    const bookmarked = isBookmarked(item.id);
    const [isExpanded, setIsExpanded] = useState(true);

    const Icon = item.type === 'grammar' ? BookOpen : ALargeSmall;

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border transition-all duration-300 group", // Rounded-2xl
                mastered
                    ? "bg-slate-50 dark:bg-slate-900/60 border-indigo-100 dark:border-indigo-900/50" // Mastered: Subtle background, no opacity drop
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-none hover:-translate-y-0.5" // Lift effect
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between p-5 gap-4"> {/* Increased padding */}
                <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                        "p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors", // Larger icon box
                        item.type === 'grammar'
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30"
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-gray-50 text-xl leading-tight tracking-tight"> {/* Better typography */}
                                {item.reading ? (
                                    <ruby className="flex flex-col-reverse justify-center gap-0.5">
                                        <span>{item.text}</span>
                                        <rt className="text-[11px] text-gray-400 dark:text-gray-500 font-medium select-none text-left tracking-wide">{item.reading}</rt>
                                    </ruby>
                                ) : (
                                    item.text
                                )}
                            </h3>

                            {/* Badges */}
                            <div className="flex items-center gap-1.5">
                                {item.type === 'grammar' && (
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                                        GRAMMAR
                                    </span>
                                )}
                                {item.jlpt && (
                                    <span className={cn(
                                        "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-transparent bg-opacity-50",
                                        item.jlpt === 'N1' ? "text-red-500 bg-red-50" :
                                            item.jlpt === 'N2' ? "text-orange-500 bg-orange-50" :
                                                item.jlpt === 'N3' ? "text-yellow-600 bg-yellow-50" :
                                                    "text-blue-500 bg-blue-50"
                                    )}>
                                        {item.jlpt}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.meaning}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Bookmark Button */}
                    <button
                        onClick={() => toggleBookmark(item.id)}
                        className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-full transition-all border shrink-0 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900",
                            bookmarked
                                ? "bg-amber-100 border-amber-200 text-amber-500 dark:bg-amber-900/20 dark:border-amber-800"
                                : "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-gray-800"
                        )}
                        title={bookmarked ? "단어장에서 제거" : "나만의 단어장에 추가"}
                    >
                        <Star className={cn("w-5 h-5 transition-transform", bookmarked ? "fill-current" : "")} />
                    </button>

                    {/* Master Check Button */}
                    <button
                        onClick={() => toggleMastery(item.id)}
                        className={cn(
                            "flex items-center justify-center w-11 h-11 rounded-full transition-all border shrink-0 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900",
                            mastered
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-md"
                                : "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-500 dark:hover:text-indigo-400 bg-white dark:bg-gray-800"
                        )}
                        title={mastered ? "학습 중으로 변경" : "마스터함 (숨기기)"}
                    >
                        <Check className={cn("w-5 h-5 stroke-[3] transition-transform", mastered ? "scale-100" : "scale-90")} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={cn(
                "px-5 pb-5 transition-opacity duration-300",
                mastered ? "opacity-80 grayscale-[10%]" : "opacity-100" // Slight visual dampening but readable
            )}>
                <p className="text-gray-700 dark:text-gray-300 leading-7 text-[15px]"> {/* Increased readability */}
                    {item.explanation}
                </p>

                {/* Tags / Metadata Grid */}
                {(item.pitchAccent || item.nuance) && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        {item.pitchAccent && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50/80 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                {item.pitchAccent}
                            </div>
                        )}
                        {item.nuance && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-500">
                                <span className="text-[10px] uppercase font-bold opacity-70">Nuance</span>
                                {item.nuance}
                            </div>
                        )}
                    </div>
                )}

                {item.examples && item.examples.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="font-bold text-gray-400 dark:text-gray-600 block mb-3 text-[10px] uppercase tracking-widest">Examples</span>
                        <ul className="space-y-3">
                            {item.examples.map((ex, idx) => (
                                <li key={idx} className="text-[14px] text-gray-600 dark:text-gray-400 pl-4 border-l-[3px] border-indigo-100 dark:border-indigo-900 py-0.5 leading-relaxed">
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
