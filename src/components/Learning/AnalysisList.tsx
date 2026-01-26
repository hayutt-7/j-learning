'use client';

import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { AnalysisCard } from './AnalysisCard';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, List, Layers, ChevronRight } from 'lucide-react';
import { CarouselView } from './CarouselView';
import { ListView } from './ListView';

interface AnalysisListProps {
    items: LearningItem[];
}

export function AnalysisList({ items }: AnalysisListProps) {
    const { shouldHide } = useLearningHistory();
    const [showHidden, setShowHidden] = useState(false);
    const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');

    // Pure derived state
    const { visibleItems, hiddenItems } = useMemo(() => {
        const visible: LearningItem[] = [];
        const hidden: LearningItem[] = [];

        items.forEach(item => {
            if (shouldHide(item.id)) {
                hidden.push(item);
            } else {
                visible.push(item);
            }
        });

        return { visibleItems: visible, hiddenItems: hidden };
    }, [items, shouldHide]);

    if (items.length === 0) return null;

    const hasHiddenItems = hiddenItems.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    상세 분석
                </h3>

                {/* View Mode Toggle */}
                {visibleItems.length > 0 && (
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('carousel')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                viewMode === 'carousel'
                                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            <Layers className="w-3.5 h-3.5 inline-block mr-1" />
                            카드
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                viewMode === 'list'
                                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            <List className="w-3.5 h-3.5 inline-block mr-1" />
                            목록
                        </button>
                    </div>
                )}
            </div>

            {visibleItems.length > 0 ? (
                viewMode === 'carousel' ? (
                    <CarouselView items={visibleItems} />
                ) : (
                    <ListView items={visibleItems} />
                )
            ) : (
                !showHidden && hasHiddenItems && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">모든 항목을 마스터했습니다! 🎉</p>
                        <button
                            onClick={() => setShowHidden(true)}
                            className="text-sm text-indigo-500 hover:text-indigo-600 font-medium hover:underline"
                        >
                            마스터한 {hiddenItems.length}개 항목 확인하기
                        </button>
                    </div>
                )
            )}

            {/* Hidden / Mastered Items Toggle */}
            {hasHiddenItems && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
                    <button
                        onClick={() => setShowHidden(!showHidden)}
                        className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        <span>{showHidden ? '완료된 항목 접기' : `마스터한 ${hiddenItems.length}개 항목 확인하기`}</span>
                        <ChevronRight className={cn("w-4 h-4 transition-transform", showHidden ? "rotate-90" : "")} />
                    </button>

                    {showHidden && (
                        <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                            <div className="relative py-2 mb-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#FDFDFD] dark:bg-gray-950 px-2 text-xs text-gray-500">완료된 항목</span>
                                </div>
                            </div>
                            {hiddenItems.map((item) => (
                                <AnalysisCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
