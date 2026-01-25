'use client';

import { useUserProgress } from '@/hooks/useUserProgress';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS_PRESET } from '@/hooks/useUserProgress';

export function AchievementsList() {
    const { achievements, checkAchievements } = useUserProgress();
    const { history } = useLearningHistory();
    const dailyGoals = useDailyGoals();
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

    // Check achievements on mount
    useEffect(() => {
        // Prepare stats for checking
        const stats = {
            totalWords: Object.values(history).length,
            // Quiz score isn't stored permanently in global stats yet, 
            // but we can check what we have.
            // Ideally, QuizGame should update a persistent 'maxQuizScore' in userProgress.
            // For now, we rely on immediate checks in QuizGame, 
            // but here we check state-based ones (streak, level).
        };

        const unlocked = checkAchievements(stats);
        if (unlocked) {
            setNewlyUnlocked(prev => [...prev, unlocked.id]);
            // Show toast or celebration?
        }
    }, [history, checkAchievements]);

    // Merge preset with current status to ensure we show all available achievements
    const displayList = ACHIEVEMENTS_PRESET.map(preset => {
        const userStatus = achievements?.find(a => a.id === preset.id);

        // If user has it unlocked, use that info (timestamp), otherwise use preset (locked)
        return {
            ...preset,
            unlockedAt: userStatus?.unlockedAt || null,
            isNew: newlyUnlocked.includes(preset.id)
        };
    });

    const unlockedCount = displayList.filter(a => a.unlockedAt).length;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        도전 과제
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        학습 목표를 달성하고 뱃지를 수집하세요
                    </p>
                </div>
                <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {unlockedCount} / {displayList.length} 달성
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {displayList.map((achievement) => {
                    const isUnlocked = !!achievement.unlockedAt;

                    return (
                        <div
                            key={achievement.id}
                            className={cn(
                                "relative flex flex-col items-center p-4 rounded-xl text-center transition-all duration-300",
                                isUnlocked
                                    ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-800 border border-transparent opacity-60 grayscale"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 flex items-center justify-center text-2xl mb-2 rounded-full shadow-inner",
                                isUnlocked
                                    ? "bg-white dark:bg-gray-800 scale-110"
                                    : "bg-gray-200 dark:bg-gray-700"
                            )}>
                                {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-400" />}
                            </div>

                            <h3 className={cn(
                                "text-sm font-bold mb-1",
                                isUnlocked ? "text-gray-900 dark:text-white" : "text-gray-500"
                            )}>
                                {achievement.title}
                            </h3>

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                {achievement.description}
                            </p>

                            {isUnlocked && achievement.unlockedAt && (
                                <div className="mt-2 text-[10px] text-indigo-400 font-medium">
                                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </div>
                            )}

                            {/* New Badge Animation Effect */}
                            {achievement.isNew && (
                                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
                                    NEW
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
