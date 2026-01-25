import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyStudyRecord {
    date: string;           // YYYY-MM-DD
    wordsLearned: number;
    minutesStudied: number;
    xpEarned: number;
    reviewsDone: number;
}

interface StudyLogState {
    records: DailyStudyRecord[];

    // Actions
    logStudy: (data: Partial<Omit<DailyStudyRecord, 'date'>>) => void;
    getRecentRecords: (days: number) => DailyStudyRecord[];
    getWeeklyData: () => DailyStudyRecord[];
    getMonthlyData: () => DailyStudyRecord[];
    getTotalStats: () => { totalWords: number; totalMinutes: number; totalXp: number; totalReviews: number };
}

const getTodayString = () => new Date().toISOString().split('T')[0];

// Generate array of dates for the past N days
const getDateRange = (days: number): string[] => {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
};

export const useStudyLog = create<StudyLogState>()(
    persist(
        (set, get) => ({
            records: [],

            logStudy: (data) => {
                const today = getTodayString();
                set((state) => {
                    const existingIndex = state.records.findIndex(r => r.date === today);

                    if (existingIndex >= 0) {
                        // Update existing record
                        const updated = [...state.records];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            wordsLearned: updated[existingIndex].wordsLearned + (data.wordsLearned || 0),
                            minutesStudied: updated[existingIndex].minutesStudied + (data.minutesStudied || 0),
                            xpEarned: updated[existingIndex].xpEarned + (data.xpEarned || 0),
                            reviewsDone: updated[existingIndex].reviewsDone + (data.reviewsDone || 0),
                        };
                        return { records: updated };
                    } else {
                        // Create new record
                        const newRecord: DailyStudyRecord = {
                            date: today,
                            wordsLearned: data.wordsLearned || 0,
                            minutesStudied: data.minutesStudied || 0,
                            xpEarned: data.xpEarned || 0,
                            reviewsDone: data.reviewsDone || 0,
                        };
                        // Keep only last 60 days
                        const trimmed = [...state.records, newRecord].slice(-60);
                        return { records: trimmed };
                    }
                });
            },

            getRecentRecords: (days) => {
                const dateRange = getDateRange(days);
                const recordMap = new Map(get().records.map(r => [r.date, r]));

                return dateRange.map(date => recordMap.get(date) || {
                    date,
                    wordsLearned: 0,
                    minutesStudied: 0,
                    xpEarned: 0,
                    reviewsDone: 0,
                });
            },

            getWeeklyData: () => {
                return get().getRecentRecords(7);
            },

            getMonthlyData: () => {
                return get().getRecentRecords(30);
            },

            getTotalStats: () => {
                const records = get().records;
                return records.reduce(
                    (acc, r) => ({
                        totalWords: acc.totalWords + r.wordsLearned,
                        totalMinutes: acc.totalMinutes + r.minutesStudied,
                        totalXp: acc.totalXp + r.xpEarned,
                        totalReviews: acc.totalReviews + r.reviewsDone,
                    }),
                    { totalWords: 0, totalMinutes: 0, totalXp: 0, totalReviews: 0 }
                );
            },
        }),
        {
            name: 'j-learning-study-log',
        }
    )
);
