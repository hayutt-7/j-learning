'use client';

import { LearningItem } from '@/lib/types';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { AnalysisCard } from './AnalysisCard';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles, List, Layers } from 'lucide-react';


interface AnalysisListProps {
    items: LearningItem[];
}

export function AnalysisList({ items }: AnalysisListProps) {
    const { shouldHide } = useLearningHistory();
    const [showHidden, setShowHidden] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

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

    // Reset index if out of bounds
    useEffect(() => {
        if (currentIndex >= visibleItems.length && visibleItems.length > 0) {
            setCurrentIndex(visibleItems.length - 1);
        } else if (visibleItems.length === 0) {
            setCurrentIndex(0);
        }
    }, [visibleItems.length, currentIndex]);

    const handleNext = useCallback(() => {
        if (currentIndex < visibleItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, visibleItems.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (viewMode !== 'carousel') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, viewMode]);

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
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
                    /* Carousel View */
                    <div className="relative group">
                        <div className="mb-3 flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500 px-1">
                            <span className="hidden sm:inline">← → 또는 스와이프로 이동</span>
                            <span className="sm:hidden">스와이프로 이동</span>
                            <span className="font-bold text-indigo-500">{currentIndex + 1} / {visibleItems.length}</span>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-1.5 mb-4">
                            {visibleItems.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "transition-all rounded-full",
                                        idx === currentIndex
                                            ? "w-8 h-2 bg-indigo-500"
                                            : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-indigo-300 dark:hover:bg-indigo-700"
                                    )}
                                    aria-label={`카드 ${idx + 1}로 이동`}
                                />
                            ))}
                        </div>

                        <div
                            className="relative"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Navigation Buttons - Desktop */}
                            <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 hidden lg:block">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-indigo-600 hover:shadow-xl hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all"
                                    aria-label="이전 카드"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 hidden lg:block">
                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === visibleItems.length - 1}
                                    className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-indigo-600 hover:shadow-xl hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all"
                                    aria-label="다음 카드"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Navigation (Overlay) */}
                            <div className="flex lg:hidden justify-between items-center absolute inset-y-0 -left-2 -right-2 pointer-events-none z-10">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="pointer-events-auto p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700 text-gray-500 disabled:opacity-0 transition-all active:scale-95"
                                    aria-label="이전 카드"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentIndex === visibleItems.length - 1}
                                    className="pointer-events-auto p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700 text-gray-500 disabled:opacity-0 transition-all active:scale-95"
                                    aria-label="다음 카드"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Card with animation */}
                            <div
                                className="animate-in fade-in slide-in-from-right-4 duration-300"
                                key={currentItem.id}
                            >
                                <AnalysisCard item={currentItem} />
                            </div>

                            {/* Next card preview hint (desktop only) */}
                            {currentIndex < visibleItems.length - 1 && (
                                <div className="absolute top-0 -right-6 w-12 h-full hidden xl:block pointer-events-none overflow-hidden opacity-30">
                                    <div className="scale-95 origin-left">
                                        <AnalysisCard item={visibleItems[currentIndex + 1]} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        {visibleItems.map((item) => (
                            <AnalysisCard key={item.id} item={item} />
                        ))}
                    </div>
                )
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
