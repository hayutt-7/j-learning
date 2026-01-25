'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Trophy, Crown, Medal, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
    user_id: string;
    username: string;
    level: number;
    total_xp: number;
    avatar_url?: string;
}

export function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { level, currentXp } = useUserProgress();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, username, level, total_xp, avatar_url')
                .order('total_xp', { ascending: false })
                .limit(10);

            if (error) throw error;
            setLeaders(data || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Need to sync current user stats first (this should actully be done in useUserProgress, but strictly for display here)
    // Real implementation should have a robust sync mechanism.

    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState('');

    const handleUpdateProfile = async () => {
        if (!user || !newUsername.trim()) return;

        try {
            // 1. Update Auth Metadata (Updates user session data immediately)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: newUsername.trim(), avatar_url: newAvatar }
            });
            if (authError) throw authError;

            // 2. Update Public Profile Table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: newUsername.trim(), avatar_url: newAvatar })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            setIsEditing(false);
            fetchLeaderboard(); // Refresh list
            alert("프로필이 성공적으로 업데이트되었습니다!");
        } catch (e: any) {
            console.error('Error updating profile:', e);
            alert(`프로필 업데이트 실패: ${e.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border-2 border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                        <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">학습 랭킹</h2>
                        <p className="text-sm text-gray-500">이번 주 학습왕은 누구?</p>
                    </div>
                </div>
                {user && (
                    <button
                        onClick={() => {
                            setNewUsername(leaders.find(l => l.user_id === user.id)?.username || '');
                            setIsEditing(true);
                        }}
                        className="text-xs font-bold text-gray-400 hover:text-indigo-500 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                    >
                        내 프로필 설정
                    </button>
                )}
            </div>

            {/* Profile Edit Modal (Inline Simple) */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">프로필 설정</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">닉네임</label>
                                <input
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    placeholder="닉네임을 입력하세요"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">취소</button>
                                <button onClick={handleUpdateProfile} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700">저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {leaders.map((leader, index) => {
                        const isMe = user?.id === leader.user_id;
                        return (
                            <div
                                key={leader.user_id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl transition-all",
                                    isMe ? "bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800" : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <div className="flex-shrink-0 w-8 text-center font-black text-lg text-gray-400">
                                    {index === 0 && <Crown className="w-6 h-6 text-yellow-500 mx-auto" />}
                                    {index === 1 && <Medal className="w-6 h-6 text-gray-400 mx-auto" />}
                                    {index === 2 && <Medal className="w-6 h-6 text-amber-600 mx-auto" />}
                                    {index > 2 && index + 1}
                                </div>
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                    {leader.avatar_url ? (
                                        <img src={leader.avatar_url} alt={leader.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("font-bold truncate", isMe ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white")}>
                                        {leader.username || '익명 사용자'}
                                        {isMe && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">나</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">Lv.{leader.level}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 dark:text-white">{leader.total_xp.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-gray-400">XP</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
