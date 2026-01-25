import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProgressState {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    lastStudyDate: string | null; // ISO Date string

    // Achievements
    achievements: Achievement[];
    checkAchievements: (stats: { totalWords?: number, quizScore?: number }) => Achievement | null;

    // Actions
    addXp: (amount: number) => void;
    checkLevelUp: () => boolean; // Returns true if leveled up
    updateStreak: () => void;
    resetProgress: (user: any) => Promise<void>;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (state: UserProgressState, stats?: any) => boolean;
    unlockedAt: string | null; // ISO Date
}

export const ACHIEVEMENTS_PRESET: Omit<Achievement, 'unlockedAt'>[] = [
    {
        id: 'streak_3',
        title: '작심삼일 탈출',
        description: '3일 연속 학습 달성',
        icon: '🔥',
        condition: (state) => state.streak >= 3
    },
    {
        id: 'streak_7',
        title: '일주일의 기적',
        description: '7일 연속 학습 달성',
        icon: '📅',
        condition: (state) => state.streak >= 7
    },
    {
        id: 'level_5',
        title: '레벨 업!',
        description: '레벨 5 달성',
        icon: '⭐',
        condition: (state) => state.level >= 5
    },
    {
        id: 'quiz_master',
        title: '퀴즈 마스터',
        description: '퀴즈 100점 달성',
        icon: '🎓',
        condition: (_, stats) => stats?.quizScore === 100
    },
    {
        id: 'night_owl',
        title: '올빼미족',
        description: '밤 10시 이후 학습',
        icon: '🦉',
        condition: () => {
            const hour = new Date().getHours();
            return hour >= 22 || hour < 2;
        }
    }
];

// XP Balance Config
export const XP_TABLE = {
    TRANSLATE: 10,
    REVIEW: 5,
    VOCAB_CORRECT: {
        'N5': 5,
        'N4': 8,
        'N3': 12,
        'N2': 18,
        'N1': 25,
        'ALL': 10 // Mixed mode
    }
};

const calculateNextLevelXp = (level: number) => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
};

export const useUserProgress = create<UserProgressState>()(
    persist(
        (set, get) => ({
            level: 1,
            currentXp: 0,
            nextLevelXp: 100,
            streak: 0,
            lastStudyDate: null,
            achievements: ACHIEVEMENTS_PRESET.map(a => ({ ...a, unlockedAt: null })),

            addXp: (amount) => {
                set((state) => {
                    let newXp = state.currentXp + amount;
                    let newLevel = state.level;
                    let newNextLevelXp = state.nextLevelXp;
                    let leveledUp = false;

                    while (newXp >= newNextLevelXp) {
                        newXp -= newNextLevelXp;
                        newLevel++;
                        newNextLevelXp = calculateNextLevelXp(newLevel);
                        leveledUp = true;
                    }

                    // Check level based achievements immediately
                    const currentAchievements = state.achievements || ACHIEVEMENTS_PRESET.map(a => ({ ...a, unlockedAt: null }));
                    const updatedAchievements = currentAchievements.map(ach => {
                        if (ach.unlockedAt) return ach;
                        // Temp state for checking
                        const tempState = { ...state, level: newLevel };
                        const preset = ACHIEVEMENTS_PRESET.find(p => p.id === ach.id);
                        if (preset && preset.condition(tempState as UserProgressState)) {
                            return { ...ach, unlockedAt: new Date().toISOString() };
                        }
                        return ach;
                    });

                    return {
                        currentXp: newXp,
                        level: newLevel,
                        nextLevelXp: newNextLevelXp,
                        achievements: updatedAchievements
                    };
                });
            },

            checkAchievements: (stats = {}) => {
                let unlocked: Achievement | null = null;
                set((state) => {
                    const currentAchievements = state.achievements || ACHIEVEMENTS_PRESET.map(a => ({ ...a, unlockedAt: null }));
                    const updatedAchievements = currentAchievements.map(ach => {
                        if (ach.unlockedAt) return ach;

                        const preset = ACHIEVEMENTS_PRESET.find(p => p.id === ach.id);
                        if (preset && preset.condition(state, stats)) {
                            const newAchievement = { ...ach, unlockedAt: new Date().toISOString() };
                            unlocked = newAchievement;
                            return newAchievement;
                        }
                        return ach;
                    });

                    return { achievements: updatedAchievements };
                });
                return unlocked;
            },

            checkLevelUp: () => {
                // Logic mostly handled in addXp, but kept for manual checks if needed
                return false;
            },

            updateStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    if (state.lastStudyDate === today) return state;

                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayString = yesterday.toISOString().split('T')[0];

                    if (state.lastStudyDate === yesterdayString) {
                        return { streak: state.streak + 1, lastStudyDate: today };
                    } else {
                        return { streak: 1, lastStudyDate: today };
                    }
                });
            },

            resetProgress: async (user: any) => {
                set({
                    level: 1,
                    currentXp: 0,
                    nextLevelXp: 100,
                    streak: 0,
                    lastStudyDate: null,
                    achievements: ACHIEVEMENTS_PRESET.map(a => ({ ...a, unlockedAt: null }))
                });
                if (user) {
                    const { supabase } = await import('@/lib/supabase');
                    await supabase.from('profiles').update({
                        level: 1,
                        total_xp: 0,
                        streak: 0,
                        last_study_date: null
                    }).eq('user_id', user.id);
                }
            }
        }),
        {
            name: 'j-learning-progress',
        }
    )
);
