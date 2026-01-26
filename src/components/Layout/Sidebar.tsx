'use client';

import { GraduationCap, Brain, Type, BarChart3, Settings, LogOut, LayoutDashboard, Music, MessageSquare, Plus, Trash2, ScrollText, Star, LogIn, Mic, User, ChevronRight, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { ChatSession, getSessions, deleteSession } from '@/lib/chat-service';
import { AuthModal } from '@/components/Auth/AuthModal';
import { ProfileModal } from '@/components/Profile/ProfileModal';
import { SettingsModal } from '@/components/Settings/SettingsModal';

export type ViewMode = 'translate' | 'vocab' | 'song' | 'stats' | 'speaking' | 'dictionary' | 'games';

interface SidebarProps {
    currentView: ViewMode;
    // ... rest of props
    onViewChange: (view: ViewMode) => void;
    currentSessionId?: string | null;
    onSessionSelect?: (sessionId: string) => void;
    onNewChat?: () => void;
    onDeleteSession?: (sessionId: string) => void;
    className?: string;
}

export function Sidebar({ currentView, onViewChange, currentSessionId, onSessionSelect, onNewChat, onDeleteSession, className }: SidebarProps) {
    // ... existing hooks

    const { user, signOut } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);

    // ... useEffects

    useEffect(() => {
        if (!user) {
            setSessions([]);
            return;
        };
        getSessions(user.id).then(setSessions);
    }, [user, currentSessionId]); // Refresh when session changes

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, sessionId });
    };

    const handleDelete = async (sessionId: string) => {
        try {
            await deleteSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (onDeleteSession) onDeleteSession(sessionId);
            setContextMenu(null);
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const menuItems = [
        { id: 'translate', label: '작문/번역', icon: Type },
        { id: 'vocab', label: '단어 암기', icon: Brain },
        { id: 'games', label: '단어 게임', icon: Star },
        { id: 'song', label: '콘텐츠 학습', icon: ScrollText },
        { id: 'dictionary', label: '일본어 사전', icon: Book },
        { id: 'stats', label: '학습 통계', icon: BarChart3 },
    ];

    return (
        <aside className={cn("flex flex-col h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors", className)}>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 min-w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={() => handleDelete(contextMenu.sessionId)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>삭제하기</span>
                    </button>
                </div>
            )}

            <div className="p-6 flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                    <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">J-Learning</span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Education AI</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
                {/* Main Menu */}
                <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-400 px-4 mb-2 uppercase tracking-wider">Menu</div>
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
                </div>

                {/* Chat History Section */}
                {user && onNewChat && onSessionSelect && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-4 mb-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Chats</div>
                            <button onClick={onNewChat} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-indigo-500 transition-colors" title="New Chat">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={onNewChat}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-left border border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700",
                                    !currentSessionId ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800" : "bg-transparent"
                                )}
                            >
                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center transition-colors", !currentSessionId ? "bg-indigo-100 dark:bg-indigo-800" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50")}>
                                    <Plus className={cn("w-3.5 h-3.5", !currentSessionId ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400")} />
                                </div>
                                <span className={cn("text-sm font-medium", !currentSessionId ? "text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200")}>New Chat</span>
                            </button>

                            {sessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => onSessionSelect(session.id)}
                                    onContextMenu={(e) => handleContextMenu(e, session.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-left truncate",
                                        currentSessionId === session.id
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                                    <span className="truncate text-sm">{session.title || '새로운 대화'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {user ? (
                    <>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2">
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {user.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {user.user_metadata?.full_name || '마이프로필'}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl transition-colors text-sm font-medium"
                        >
                            <Settings className="w-5 h-5" />
                            <span>설정</span>
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>로그아웃</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>로그인</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
