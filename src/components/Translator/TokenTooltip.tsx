'use client';

import * as HoverCard from '@radix-ui/react-hover-card';
import { LearningItem } from '@/lib/types';
import { BookOpen, ALargeSmall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TokenTooltipProps {
    children: React.ReactNode;
    item?: LearningItem;
    reading?: string; // Furigana to display if no item
}

export function TokenTooltip({ children, item, reading }: TokenTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!item) {
        // If there's no analysis item but there is a reading (furigana), 
        // we could optionally show a simple tooltip, or just render children.
        // For now, let's just render children to keep it simple unless we want to show reading on hover.
        // Given the requirement is specific to "meaning or grammar", we prioritize items.
        return <>{children}</>;
    }

    const Icon = item.type === 'grammar' ? BookOpen : ALargeSmall;

    return (
        <HoverCard.Root openDelay={200} closeDelay={100} onOpenChange={setIsOpen}>
            <HoverCard.Trigger asChild>
                <button
                    className={cn(
                        "inline-block rounded-md transition-colors cursor-help decoration-indigo-300/50 underline-offset-4 decoration-2",
                        // Identify clickable words with separate styling
                        "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                        isOpen && "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    )}
                >
                    {children}
                </button>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content
                    className="z-50 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                >
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            item.type === 'grammar'
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        )}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                                {item.text}
                                {item.jlpt && (
                                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-gray-400 border px-1 rounded-sm">
                                        {item.jlpt}
                                    </span>
                                )}
                            </h4>
                            {item.reading && (
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                                    {item.reading}
                                </p>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                                {item.meaning}
                            </p>
                        </div>
                    </div>

                    <HoverCard.Arrow className="fill-white dark:fill-gray-900 stroke-gray-100 dark:stroke-gray-800" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    );
}
