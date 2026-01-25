'use client';

import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { AnalysisCard } from './AnalysisCard';
import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface AnalysisListProps {
    items: LearningItem[];
}

export function AnalysisList({ items }: AnalysisListProps) {
    const { shouldHide } = useLearningHistory();
    const [showHidden, setShowHidden] = useState(false);

    // React Best Practice: No side-effects (exposure recording) in render/effect

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    상세 분석
                </h3>
                {hasHiddenItems && (
                    <button
                        onClick={() => setShowHidden(!showHidden)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        {showHidden ? '숨기기' : `마스터한 ${hiddenItems.length}개 항목 보기`}
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {visibleItems.map((item) => (
                    <AnalysisCard key={item.id} item={item} />
                ))}

                {visibleItems.length === 0 && !showHidden && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">모든 항목을 마스터했습니다! 🎉</p>
                    </div>
                )}
            </div>

            {hasHiddenItems && showHidden && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#FDFDFD] dark:bg-gray-950 px-2 text-xs text-gray-500">완료된 항목</span>
                        </div>
                    </div>
                    <div className="grid gap-4 opacity-75 grayscale-[20%]">
                        {hiddenItems.map((item) => (
                            <AnalysisCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
