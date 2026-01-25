import { ReactNode, useState, useEffect } from 'react';
import { QuizModal } from '../Quiz/QuizModal';
import { LearningLogModal } from '../Learning/LearningLogModal';
import { ReviewModal } from '../Review/ReviewModal';
import { StatsModal } from '../Stats/StatsModal';
import { AuthModal } from '../Auth/AuthModal';
import { ProfileModal } from '../Profile/ProfileModal';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useAuth } from '@/hooks/useAuth';
import { UserSync } from '../Social/UserSync';
import { useTheme } from 'next-themes';
import { Sidebar, ViewMode } from './Sidebar';
import { MobileNav } from './MobileNav';
import { User, LogIn, Bell } from 'lucide-react';

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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
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
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[#FDFDFD] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
            <UserSync />

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64">
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsReviewOpen(true)}
                            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            {dueCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        {user ? (
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                            >
                                {user.email?.[0].toUpperCase() || <User className="w-4 h-4" />}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsAuthOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>로그인</span>
                            </button>
                        )}
                    </div>
                </header>
                <MobileNav currentView={currentView} onViewChange={onViewChange} />
            </div>

            <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
            <LearningLogModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
            <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            <main className="flex-1 lg:pl-64 flex flex-col h-full w-full overflow-hidden pt-16 pb-16 lg:py-0">
                <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8 h-full flex flex-col overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

