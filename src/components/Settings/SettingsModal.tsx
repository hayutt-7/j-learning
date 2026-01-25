'use client';

import { useEffect, useState } from 'react';
import { X, Mail, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch linked identities
    useEffect(() => {
        if (isOpen && user) {
            const identities = user.identities || [];
            const providers = identities.map((id: any) => id.provider);
            setLinkedProviders(providers);
        }
    }, [isOpen, user]);

    const handleLinkAccount = async (provider: 'google' | 'kakao') => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    // Supabase handles linking if user is already logged in
                }
            });

            if (error) throw error;

        } catch (err: any) {
            console.error('Error linking account:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">설정</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* User Profile Info */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">내 계정</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email}</span>
                                <span className="text-xs text-gray-500">가입일: {new Date(user?.created_at || '').toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Linking */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">소셜 계정 연동</label>
                            {isLoading && <span className="text-xs text-indigo-500 animate-pulse">처리중...</span>}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Google */}
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Google</span>
                            </div>
                            {linkedProviders.includes('google') ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                                    <Check className="w-3.5 h-3.5" />
                                    연동됨
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleLinkAccount('google')}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-gray-900 dark:bg-gray-700 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    연동하기
                                </button>
                            )}
                        </div>

                        {/* Kakao */}
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#000000]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 3C5.925 3 1 6.925 1 11.775c0 3.375 2.275 6.25 5.7 7.725-.2 0.725-.725 2.65-.825 3.025-.15.55.2.55.425.35l5.025-3.325c.225.025.45.025.675.025 6.075 0 11-3.925 11-8.775S18.075 3 12 3z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Kakao</span>
                            </div>
                            {linkedProviders.includes('kakao') ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                                    <Check className="w-3.5 h-3.5" />
                                    연동됨
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleLinkAccount('kakao')}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-900 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors disabled:opacity-50"
                                >
                                    연동하기
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 text-[10px] text-gray-400 text-center">
                        계정을 연동하면 어떤 방식으로든 로그인할 수 있습니다.
                    </div>
                </div>
            </div>
        </div>
    );
}
