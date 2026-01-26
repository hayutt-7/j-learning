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
    return (
        <div className="relative group select-none"> {/* Prevent text selection during swipe */}
            {/* Card Container */}
            <div
                className="relative overflow-hidden p-1" // Added padding to prevent shadow clipping
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className="animate-in fade-in slide-in-from-right-4 duration-300"
                    key={currentIndex} // Changed key to index to force re-render animation consistently
                >
                    <AnalysisCard item={currentItem} />
                </div>
            </div>

            {/* Navigation Controls (Bottom Bar for Mobile & Desktop) */}
            <div className="flex items-center justify-between mt-4 px-2">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    aria-label="이전 카드"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-indigo-500 text-sm tracking-widest">
                        {currentIndex + 1} <span className="text-gray-300 dark:text-gray-600">/</span> {items.length}
                    </span>
                    {/* Mini Progress Dots */}
                    <div className="flex justify-center gap-1">
                        {items.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "transition-all rounded-full h-1.5",
                                    idx === currentIndex
                                        ? "w-6 bg-indigo-500"
                                        : "w-1.5 bg-gray-200 dark:bg-gray-700"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1}
                    className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    aria-label="다음 카드"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
