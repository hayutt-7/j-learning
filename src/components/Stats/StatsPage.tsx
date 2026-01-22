'use client';

import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Trophy, TrendingUp, Calendar, Activity, Zap, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function StatsPage() {
    const { history } = useLearningHistory();
    const { level, currentXp, nextLevelXp, streak } = useUserProgress();

    const stats = useMemo(() => {
        const items = Object.values(history);
        const total = items.length;
        const mastered = items.filter(i => i.isMastered).length;

        const jlptCounts: Record<string, number> = { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0 };
        items.forEach(item => {
            const lvl = item.jlpt || 'N5';
            if (jlptCounts[lvl] !== undefined) jlptCounts[lvl]++;
        });

        const today = new Date().setHours(0, 0, 0, 0);
        const studiedToday = items.filter(i => i.lastSeenAt >= today).length;

        return { total, mastered, jlptCounts, studiedToday };
    }, [history]);

    const xpProgress = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">학습 통계</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">나의 학습 현황을 확인하세요</p>

            {/* Level Progress Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium">현재 레벨</p>
                        <p className="text-5xl font-black">Lv.{level}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-8 h-8" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-indigo-200">다음 레벨까지</span>
                        <span className="font-bold">{currentXp} / {nextLevelXp} XP</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
                        <Trophy className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">암기 완료</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.mastered}</p>
                    <p className="text-xs text-gray-400 mt-1">개</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">전체 항목</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">개 학습함</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">오늘 학습</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.studiedToday}</p>
                    <p className="text-xs text-gray-400 mt-1">개</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-3">
                        <Flame className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">연속 학습</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{streak}</p>
                    <p className="text-xs text-gray-400 mt-1">일째 🔥</p>
                </div>
            </div>

            {/* JLPT Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">JLPT 레벨별 학습량</h3>
                <div className="space-y-4">
                    {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map(lvl => {
                        const count = stats.jlptCounts[lvl] || 0;
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        const colors: Record<string, string> = {
                            N5: 'bg-emerald-500',
                            N4: 'bg-blue-500',
                            N3: 'bg-yellow-500',
                            N2: 'bg-orange-500',
                            N1: 'bg-red-500',
                        };
                        return (
                            <div key={lvl} className="flex items-center gap-4">
                                <div className="w-10 text-sm font-bold text-gray-600 dark:text-gray-300">{lvl}</div>
                                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-700", colors[lvl])}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-16 text-right text-sm text-gray-600 dark:text-gray-300 font-bold">{count} 개</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
