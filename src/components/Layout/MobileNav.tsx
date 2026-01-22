'use client';

import { Brain, Type, BarChart3, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewMode } from './Sidebar';

interface MobileNavProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
    const navItems = [
        { id: 'translate', label: '작문', icon: Type },
        { id: 'vocab', label: '단어', icon: Brain },
        { id: 'stats', label: '통계', icon: BarChart3 },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as ViewMode)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors active:scale-95",
                                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
