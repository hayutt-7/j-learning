'use client';

import { LearningItem } from '@/lib/types';
import { AnalysisCard } from './AnalysisCard';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselViewProps {
    items: LearningItem[];
}

export function CarouselView({ items }: CarouselViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const currentItem = items[currentIndex];

    // Reset index if items change significantly
    useEffect(() => {
        if (currentIndex >= items.length) {
            setCurrentIndex(0);
        }
    }, [items.length, currentIndex]);

    const handleNext = useCallback(() => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, items.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
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
    }, [handleNext, handlePrev]);

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

    return (
        <div className="relative group">
            <div className="mb-3 flex items-center justify-end text-xs font-medium px-1">
                <span className="font-bold text-indigo-500">{currentIndex + 1} / {items.length}</span>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 mb-4">
                {items.map((_, idx) => (
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
                        disabled={currentIndex === items.length - 1}
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
                        disabled={currentIndex === items.length - 1}
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
            </div>
        </div>
    );
}
