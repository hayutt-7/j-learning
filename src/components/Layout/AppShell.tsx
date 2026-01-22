
import { ReactNode, useState, useEffect } from 'react';
import { GraduationCap, BrainCircuit, History, Brain, BarChart3, Sun, Moon, User, LogOut } from 'lucide-react';
import { QuizModal } from '../Quiz/QuizModal';
import { LearningLogModal } from '../Learning/LearningLogModal';
import { ReviewModal } from '../Review/ReviewModal';
import { StatsModal } from '../Stats/StatsModal';
import { AuthModal } from '../Auth/AuthModal';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, loading: authLoading, signOut } = useAuth();

    // Check for due items for badge
    const { getDueItems, history } = useLearningHistory();
    const [dueCount, setDueCount] = useState(0);

    useEffect(() => {
        setDueCount(getDueItems().length);
        setMounted(true);
    }, [history, getDueItems]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-gray-100">
                            J-Learning <span className="text-indigo-600 dark:text-indigo-400">Focus</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors mr-1"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        )}

                        <button
                            onClick={() => setIsStatsOpen(true)}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors mr-1"
                            title="학습 통계"
                        >
                            <BarChart3 className="w-5 h-5" />
                        </button>

                        {dueCount > 0 && (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="relative flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-2 rounded-full transition-colors mr-1"
                            >
                                <Brain className="w-4 h-4" />
                                복습
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {dueCount}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => setIsLogsOpen(true)}
                            className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-full transition-colors"
                        >
                            <History className="w-4 h-4" />
                            기록
                        </button>
                        <button
                            onClick={() => setIsQuizOpen(true)}
                            className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            퀴즈
                        </button>

                        {/* Auth Button */}
                        {mounted && !authLoading && (
                            user ? (
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-full transition-colors ml-2"
                                    title="로그아웃"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="flex items-center gap-2 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors ml-2"
                                >
                                    <User className="w-4 h-4" />
                                    로그인
                                </button>
                            )
                        )}
                    </div>
                </div>
            </header>

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
            <LearningLogModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
            <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

