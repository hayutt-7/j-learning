import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProgressState {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    lastStudyDate: string | null; // ISO Date string

    // Actions
    addXp: (amount: number) => void;
    checkLevelUp: () => boolean; // Returns true if leveled up
    updateStreak: () => void;
    resetProgress: (user: any) => Promise<void>;
}

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

                    return {
                        currentXp: newXp,
                        level: newLevel,
                        nextLevelXp: newNextLevelXp
                    };
                });
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
                    lastStudyDate: null
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
