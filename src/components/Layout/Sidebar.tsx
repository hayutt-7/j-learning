'use client';

import { GraduationCap, Brain, Type, BarChart3, Settings, LogOut, LayoutDashboard, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export type ViewMode = 'translate' | 'vocab' | 'song' | 'stats';

interface SidebarProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    className?: string;
}

export function Sidebar({ currentView, onViewChange, className }: SidebarProps) {
    const { signOut } = useAuth();

    const menuItems = [
        { id: 'translate', label: '작문/번역', icon: Type },
        { id: 'vocab', label: '단어 암기', icon: Brain },
        { id: 'song', label: '노래 학습', icon: Music },
        { id: 'stats', label: '학습 통계', icon: BarChart3 },
    ];

    return (
        <aside className={cn("flex flex-col h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors", className)}>
            <div className="p-6 flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                    <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">J-Learning</span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Education AI</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <div className="text-xs font-bold text-gray-400 px-4 mb-4 uppercase tracking-wider">Menu</div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as ViewMode)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                                isActive
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-gray-600")} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>로그아웃</span>
                </button>
            </div>
        </aside>
    );
}
