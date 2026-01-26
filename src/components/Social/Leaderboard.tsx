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
    const { user } = useAuth();
    const [myProfile, setMyProfile] = useState<LeaderboardEntry | null>(null);
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        if (user) fetchMyProfile();
    }, [user]);

    const fetchMyProfile = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, username, level, total_xp, avatar_url')
                .eq('user_id', user.id)
                .single();

            if (data) setMyProfile(data);
        } catch (e) {
            console.error(e);
        }
    };

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

    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState('');

    const handleUpdateProfile = async () => {
        if (!user || !newUsername.trim()) return;

        try {
            // 1. Update Auth Metadata
            await supabase.auth.updateUser({
                data: { full_name: newUsername.trim(), avatar_url: newAvatar }
            });

            // 2. Update Public Profile Table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: newUsername.trim(), avatar_url: newAvatar })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            setIsEditing(false);
            fetchLeaderboard();
            fetchMyProfile();
            alert("프로필이 성공적으로 업데이트되었습니다!");
        } catch (e: any) {
            console.error('Error updating profile:', e);
            alert(`프로필 업데이트 실패: ${e.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
            {/* Header Section with Background */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-yellow-100 dark:border-yellow-900/30">
                            <Trophy className="w-7 h-7 text-yellow-500 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">학습 랭킹</h2>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">이번 주 학습왕은 누구?</p>
                        </div>
                    </div>
                    {user && (
                        <button
                            onClick={() => {
                                setNewUsername(myProfile?.username || user.user_metadata.full_name || '');
                                setIsEditing(true);
                            }}
                            className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl transition-all hover:shadow-md active:scale-95"
                        >
                            내 프로필 설정
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                {/* Profile Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-black mb-6 text-center text-gray-900 dark:text-white">프로필 설정</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">닉네임</label>
                                    <input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                                        placeholder="닉네임을 입력하세요"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">취소</button>
                                    <button onClick={handleUpdateProfile} className="flex-1 py-3.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5">저장</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaders.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>아직 랭킹 데이터가 없습니다.</p>
                            </div>
                        ) : (
                            leaders.map((leader, index) => {
                                const isMe = user?.id === leader.user_id;
                                return (
                                    <div
                                        key={leader.user_id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl transition-all border",
                                            isMe
                                                ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-sm"
                                                : "bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-100 dark:hover:border-gray-700"
                                        )}
                                    >
                                        <div className="flex-shrink-0 w-10 text-center font-black text-xl text-gray-300">
                                            {index === 0 && <Crown className="w-7 h-7 text-amber-400 fill-current drop-shadow-sm mx-auto" />}
                                            {index === 1 && <Medal className="w-7 h-7 text-gray-300 fill-current mx-auto" />}
                                            {index === 2 && <Medal className="w-7 h-7 text-amber-700 fill-current mx-auto" />}
                                            {index > 2 && index + 1}
                                        </div>
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
                                            {leader.avatar_url ? (
                                                <img src={leader.avatar_url} alt={leader.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-bold truncate text-base", isMe ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-white")}>
                                                {leader.username || '익명 사용자'}
                                                {isMe && <span className="ml-2 text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full align-middle">ME</span>}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Level {leader.level} 플레이어</p>
                                        </div>
                                        <div className="text-right px-2">
                                            <p className="font-black text-lg text-gray-900 dark:text-white tracking-tight">{leader.total_xp.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total XP</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
