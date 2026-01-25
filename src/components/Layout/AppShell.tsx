import { ReactNode, useState, useEffect } from 'react';
import { QuizModal } from '../Quiz/QuizModal';
import { LearningLogModal } from '../Learning/LearningLogModal';
import { ReviewModal } from '../Review/ReviewModal';
import { StatsModal } from '../Stats/StatsModal';
import { AuthModal } from '../Auth/AuthModal';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useAuth } from '@/hooks/useAuth';
import { UserSync } from '../Social/UserSync';
import { useTheme } from 'next-themes';
import { Sidebar, ViewMode } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
    children: ReactNode;
    currentView?: ViewMode; // Optional for now to not break other pages if any
    onViewChange?: (view: ViewMode) => void;
    currentSessionId?: string | null;
    onSessionSelect?: (sessionId: string) => void;
    onNewChat?: () => void;
    onDeleteSession?: (sessionId: string) => void;
}

export function AppShell({ children, currentView = 'translate', onViewChange = () => { }, currentSessionId, onSessionSelect, onNewChat, onDeleteSession }: AppShellProps) {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, loading: authLoading, signOut } = useAuth();

    // Check for due items for badge
    const { getDueItems, history, syncWithSupabase } = useLearningHistory();
    const [dueCount, setDueCount] = useState(0);

    useEffect(() => {
        setDueCount(getDueItems().length);
        setMounted(true);
    }, [history, getDueItems]);

    // Optimize: Sync with cloud when user logs in
    useEffect(() => {
        if (user) {
            syncWithSupabase(user);
        }
    }, [user, syncWithSupabase]);

    return (
        <div className="flex min-h-screen bg-[#FDFDFD] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
            <UserSync />

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
                <Sidebar
                    currentView={currentView}
                    onViewChange={onViewChange}
                    currentSessionId={currentSessionId}
                    onSessionSelect={onSessionSelect}
                    onNewChat={onNewChat}
                    onDeleteSession={onDeleteSession}
                />
            </div>

            {/* Mobile Header (Simplified) & Bottom Nav */}
            <div className="lg:hidden">
                <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 h-16 flex items-center px-4 justify-between">
                    <span className="font-bold text-lg">J-Learning</span>
                    <button
                        onClick={() => setIsReviewOpen(true)}
                        className="relative p-2"
                    >
                        {dueCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                        <span className="text-xs font-bold text-indigo-600">복습</span>
                    </button>
                </header>
                <MobileNav currentView={currentView} onViewChange={onViewChange} />
            </div>

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
            <LearningLogModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
            <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            <main className="flex-1 lg:pl-64 pt-20 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

