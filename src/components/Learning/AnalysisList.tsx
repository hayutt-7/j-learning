'use client';

import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { AnalysisCard } from './AnalysisCard';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';


interface AnalysisListProps {
    items: LearningItem[];
}

export function AnalysisList({ items }: AnalysisListProps) {
    const { shouldHide } = useLearningHistory();
    const [showHidden, setShowHidden] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    // Reset index if out of bounds (e.g., items hidden)
    useEffect(() => {
        if (currentIndex >= visibleItems.length && visibleItems.length > 0) {
            setCurrentIndex(visibleItems.length - 1);
        } else if (visibleItems.length === 0) {
            setCurrentIndex(0); // Reset if no visible items
        }
    }, [visibleItems.length, currentIndex]);

    const handleNext = () => {
        if (currentIndex < visibleItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (items.length === 0) return null;

    const hasHiddenItems = hiddenItems.length > 0;
    const currentItem = visibleItems[currentIndex];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    상세 분석
                </h3>
            </div>

            {/* Carousel View for Visible Items */}
            {visibleItems.length > 0 ? (
                <div className="relative group">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500 px-1">
                        <span>학습 카드</span>
                        <span>{currentIndex + 1} / {visibleItems.length}</span>
                    </div>

                    <div className="relative">
                        {/* Navigation Buttons */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 hidden lg:block">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 hidden lg:block">
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === visibleItems.length - 1}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Navigation (Overlay) */}
                        <div className="flex lg:hidden justify-between items-center absolute inset-y-0 -left-2 -right-2 pointer-events-none">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700 text-gray-500 disabled:opacity-0 transition-opacity"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === visibleItems.length - 1}
                                className="pointer-events-auto p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700 text-gray-500 disabled:opacity-0 transition-opacity"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Card */}
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={currentItem.id}>
                            <AnalysisCard item={currentItem} />
                        </div>
                    </div>
                </div>
            ) : (
                !showHidden && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">모든 항목을 마스터했습니다! 🎉</p>
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
