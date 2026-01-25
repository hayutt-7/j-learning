'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Link2, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, signInWithOAuth } = useAuth();
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            // Get current nickname from profile
            fetchProfile();
            // Get linked providers
            const providers = user.app_metadata?.providers || [];
            setLinkedProviders(providers);
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();
        if (data?.username) {
            setNickname(data.username);
        }
    };

    const handleSave = async () => {
        if (!user || !nickname.trim()) return;
        setIsLoading(true);

        try {
            // Update auth metadata
            await supabase.auth.updateUser({
                data: { full_name: nickname.trim() }
            });

            // Update profile table
            await supabase
                .from('profiles')
                .upsert({
                    user_id: user.id,
                    username: nickname.trim(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('프로필 저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkProvider = async (provider: 'google' | 'kakao') => {
        try {
            await signInWithOAuth(provider);
        } catch (e) {
            console.error('Error linking provider:', e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        마이프로필
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar & Email */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {nickname ? nickname[0].toUpperCase() : <User className="w-8 h-8" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                {nickname || '닉네임 미설정'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Nickname Edit */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            닉네임
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !nickname.trim()}
                                className={cn(
                                    "px-4 py-3 rounded-xl font-bold transition-all",
                                    isSaved
                                        ? "bg-green-500 text-white"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isSaved ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    "저장"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Linked Accounts */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            연동된 계정
                        </label>
                        <div className="space-y-3">
                            {/* Google */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="font-medium text-gray-900 dark:text-white">Google</span>
                                </div>
                                {linkedProviders.includes('google') ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3" /> 연동됨
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleLinkProvider('google')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Link2 className="w-3 h-3" /> 연동하기
                                    </button>
                                )}
                            </div>

                            {/* Kakao */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-[#FEE500] rounded flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
                                            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.706 4.8 4.29 6.045-.188.712-.68 2.486-.775 2.895-.122.522.19.467.394.333.25-.164 3.95-2.677 4.542-3.085.508.077 1.033.12 1.574.12 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" fill="#3A1D1D" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">카카오</span>
                                </div>
                                {linkedProviders.includes('kakao') ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3" /> 연동됨
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleLinkProvider('kakao')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Link2 className="w-3 h-3" /> 연동하기
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
