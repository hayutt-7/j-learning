'use client';

import { GraduationCap, Brain, Type, BarChart3, Settings, LogOut, LayoutDashboard, Music, MessageSquare, Plus, Trash2, ScrollText, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { ChatSession, getSessions, deleteSession } from '@/lib/chat-service';

export type ViewMode = 'translate' | 'vocab' | 'song' | 'stats';

interface SidebarProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    currentSessionId?: string | null;
    onSessionSelect?: (sessionId: string) => void;
    onNewChat?: () => void;
    onDeleteSession?: (sessionId: string) => void;
    className?: string;
}

export function Sidebar({ currentView, onViewChange, currentSessionId, onSessionSelect, onNewChat, onDeleteSession, className }: SidebarProps) {
    const { user, signOut } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);

    useEffect(() => {
        if (!user) return;
        getSessions(user.id).then(setSessions);
    }, [user, currentSessionId]); // Refresh when session changes

    // Close context menu on click outside
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
            setContextMenu(null); // Close context menu after action
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const menuItems = [
        { id: 'translate', label: '작문/번역', icon: Type },
        { id: 'vocab', label: '단어 암기', icon: Brain },
        { id: 'song', label: '콘텐츠 학습', icon: ScrollText },
        { id: 'stats', label: '학습 통계', icon: BarChart3 },
    ];

    return (
        <aside className={cn("flex flex-col h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors", className)}>
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
