import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailyGoalsState {
    // Settings
    wordsGoal: number;
    minutesGoal: number;
    reviewsGoal: number;

    // Today's progress
    todayWords: number;
    todayMinutes: number;
    todayReviews: number;
    todayXp: number;
    todayDate: string; // YYYY-MM-DD

    // Actions
    setGoals: (words: number, minutes: number, reviews: number) => void;
    addWords: (count: number) => void;
    addMinutes: (minutes: number) => void;
    addReviews: (count: number) => void;
    addXp: (xp: number) => void;
    resetIfNewDay: () => boolean; // Returns true if reset happened
    getProgress: () => { words: number; minutes: number; reviews: number; overall: number };
    isGoalComplete: () => boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useDailyGoals = create<DailyGoalsState>()(
    persist(
        (set, get) => ({
            // Default goals
            wordsGoal: 20,
            minutesGoal: 15,
            reviewsGoal: 10,

            // Today's progress (reset daily)
            todayWords: 0,
            todayMinutes: 0,
            todayReviews: 0,
            todayXp: 0,
            todayDate: getTodayString(),

            setGoals: (words, minutes, reviews) => {
                set({ wordsGoal: words, minutesGoal: minutes, reviewsGoal: reviews });
            },

            addWords: (count) => {
                get().resetIfNewDay();
                set((state) => ({ todayWords: state.todayWords + count }));
            },

            addMinutes: (minutes) => {
                get().resetIfNewDay();
                set((state) => ({ todayMinutes: state.todayMinutes + minutes }));
            },

            addReviews: (count) => {
                get().resetIfNewDay();
                set((state) => ({ todayReviews: state.todayReviews + count }));
            },

            addXp: (xp) => {
                get().resetIfNewDay();
                set((state) => ({ todayXp: state.todayXp + xp }));
            },

            resetIfNewDay: () => {
                const today = getTodayString();
                if (get().todayDate !== today) {
                    set({
                        todayWords: 0,
                        todayMinutes: 0,
                        todayReviews: 0,
                        todayXp: 0,
                        todayDate: today,
                    });
                    return true;
                }
                return false;
            },

            getProgress: () => {
                const state = get();
                state.resetIfNewDay();

                const words = Math.min((state.todayWords / state.wordsGoal) * 100, 100);
                const minutes = Math.min((state.todayMinutes / state.minutesGoal) * 100, 100);
                const reviews = Math.min((state.todayReviews / state.reviewsGoal) * 100, 100);
                const overall = (words + minutes + reviews) / 3;

                return { words, minutes, reviews, overall };
            },

            isGoalComplete: () => {
                const progress = get().getProgress();
                return progress.overall >= 100;
            },
        }),
        {
            name: 'j-learning-daily-goals',
        }
    )
);
