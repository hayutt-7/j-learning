import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningHistoryMap, LearningItem, LearningHistoryItem } from '@/lib/types';

interface LearningHistoryState {
    history: LearningHistoryMap;

    // Actions
    recordExposure: (item: LearningItem) => void;
    // SRS Actions
    reviewItem: (itemId: string, quality: number) => void;
    getDueItems: () => LearningHistoryItem[];

    toggleMastery: (itemId: string) => void; // Legacy manual override
    isMastered: (itemId: string) => boolean;
    shouldHide: (itemId: string) => boolean;
}

export const useLearningHistory = create<LearningHistoryState>()(
    persist(
        (set, get) => ({
            history: {},

            recordExposure: (item) => {
                set((state) => {
                    const current = state.history[item.id];

                    // If it's a new item, initialize SRS defaults
                    if (!current) {
                        return {
                            history: {
                                ...state.history,
                                [item.id]: {
                                    itemId: item.id,
                                    text: item.text,
                                    type: item.type,
                                    meaning: item.meaning,
                                    jlpt: item.jlpt,
                                    exposureCount: 1,
                                    lastSeenAt: Date.now(),
                                    isMastered: false,
                                    // SRS Defaults
                                    easeFactor: 2.5,
                                    interval: 0,
                                    repetitions: 0,
                                    nextReviewDate: Date.now(), // Due immediately
                                },
                            },
                        };
                    }

                    // Existing item exposed again contextually (not a formal review)
                    return {
                        history: {
                            ...state.history,
                            [item.id]: {
                                ...current,
                                exposureCount: current.exposureCount + 1,
                                lastSeenAt: Date.now(),
                            },
                        },
                    };
                });
            },

            reviewItem: (itemId, quality) => {
                // quality: 0-5 (0: complete blackout, 3: pass, 5: perfect)
                set((state) => {
                    const item = state.history[itemId];
                    if (!item) return state;

                    // SM-2 Algorithm Implementation
                    let { easeFactor, interval, repetitions } = item;

                    if (quality >= 3) {
                        // Correct response
                        if (repetitions === 0) {
                            interval = 1;
                        } else if (repetitions === 1) {
                            interval = 6;
                        } else {
                            interval = Math.round(interval * easeFactor);
                        }
                        repetitions += 1;
                    } else {
                        // Incorrect response
                        repetitions = 0;
                        interval = 1;
                    }

                    // Update Ease Factor
                    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                    if (easeFactor < 1.3) easeFactor = 1.3;

                    // Calculate next review date (interval in days)
                    const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

                    return {
                        history: {
                            ...state.history,
                            [itemId]: {
                                ...item,
                                easeFactor,
                                interval,
                                repetitions,
                                nextReviewDate,
                                lastSeenAt: Date.now(),
                                isMastered: interval > 180, // Auto-master if interval > 6 months
                            }
                        }
                    };
                });
            },

            getDueItems: () => {
                const now = Date.now();
                return Object.values(get().history).filter(item => {
                    if (item.isMastered) return false;
                    // If nextReviewDate is missing (legacy items), treat as due
                    return !item.nextReviewDate || item.nextReviewDate <= now;
                }).sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0));
            },

            toggleMastery: (itemId) => {
                set((state) => {
                    const current = state.history[itemId];
                    if (!current) return state;

                    return {
                        history: {
                            ...state.history,
                            [itemId]: {
                                ...current,
                                isMastered: !current.isMastered,
                            },
                        },
                    };
                });
            },

            isMastered: (itemId) => {
                return !!get().history[itemId]?.isMastered;
            },

            shouldHide: (itemId) => {
                const item = get().history[itemId];
                if (!item) return false;
                // Hide if mastered OR exposed 3+ times
                return item.isMastered || item.exposureCount >= 3;
            },
        }),
        {
            name: 'j-learning-history',
        }
    )
);
