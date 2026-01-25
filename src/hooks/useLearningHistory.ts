import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningHistoryMap, LearningItem, LearningHistoryItem } from '@/lib/types';

interface LearningHistoryState {
    history: LearningHistoryMap;

    // Actions
    recordExposure: (item: LearningItem) => void;
    recordExposures: (items: LearningItem[]) => void;
    // SRS Actions
    reviewItem: (itemId: string, quality: number) => void;
    getDueItems: () => LearningHistoryItem[];

    toggleMastery: (itemId: string) => void; // Legacy manual override
    isMastered: (itemId: string) => boolean;
    shouldHide: (itemId: string) => boolean;
    syncWithSupabase: (user: any) => Promise<void>;
}

export const useLearningHistory = create<LearningHistoryState>()(
    persist(
        (set, get) => ({
            history: {},

            recordExposure: (item) => {
                get().recordExposures([item]);
            },

            recordExposures: (items) => {
                set((state) => {
                    const newHistory = { ...state.history };
                    const now = Date.now();
                    let hasChanges = false;

                    items.forEach(item => {
                        const current = newHistory[item.id];

                        // Prevent duplicates within short timeframe (debounce 2s)
                        if (current && (now - current.lastSeenAt < 2000)) {
                            return;
                        }

                        hasChanges = true;

                        if (!current) {
                            newHistory[item.id] = {
                                itemId: item.id,
                                text: item.text,
                                type: item.type,
                                meaning: item.meaning,
                                jlpt: item.jlpt,
                                reading: item.reading,
                                exposureCount: 1,
                                lastSeenAt: now,
                                isMastered: false,
                                // SRS Defaults
                                easeFactor: 2.5,
                                interval: 0,
                                repetitions: 0,
                                nextReviewDate: now,
                            };
                        } else {
                            newHistory[item.id] = {
                                ...current,
                                exposureCount: current.exposureCount + 1,
                                lastSeenAt: now,
                            };
                        }
                    });

                    return hasChanges ? { history: newHistory } : state;
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
                // Only hide if explicitly mastered
                return item.isMastered;
            },

            syncWithSupabase: async (user: any) => { // User type explicit import avoided to reduce dependency complexity for now or use generic
                if (!user) return;

                const { supabase } = await import('@/lib/supabase');
                const localHistory = get().history;

                // 1. Pull remote data
                const { data: remoteLogs, error } = await supabase
                    .from('study_logs')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Failed to pull study logs:', error);
                    return;
                }

                const mergedHistory: LearningHistoryMap = { ...localHistory };
                const itemsToPush: any[] = [];

                // 2. Merge Remote -> Local
                const remoteMap: Record<string, any> = {};
                remoteLogs?.forEach(log => {
                    remoteMap[log.item_id] = log;
                    const localItem = localHistory[log.item_id];
                    const remoteItem = log.data as LearningHistoryItem;

                    if (!localItem) {
                        // New from remote
                        mergedHistory[log.item_id] = remoteItem;
                    } else {
                        // Conflict resolution: Last Seen wins
                        if (remoteItem.lastSeenAt > localItem.lastSeenAt) {
                            mergedHistory[log.item_id] = remoteItem;
                        } else if (localItem.lastSeenAt > remoteItem.lastSeenAt) {
                            // Local is newer, needs push
                            itemsToPush.push({
                                user_id: user.id,
                                item_id: localItem.itemId,
                                data: localItem,
                                last_seen_at: localItem.lastSeenAt,
                                updated_at: new Date().toISOString()
                            });
                        }
                    }
                });

                // 3. Identify Local -> Remote (New items)
                Object.values(localHistory).forEach(item => {
                    if (!remoteMap[item.itemId]) {
                        itemsToPush.push({
                            user_id: user.id,
                            item_id: item.itemId,
                            data: item,
                            last_seen_at: item.lastSeenAt,
                            updated_at: new Date().toISOString()
                        });
                    }
                });

                // 4. Update Local State
                set({ history: mergedHistory });

                // 5. Push updates to Supabase
                if (itemsToPush.length > 0) {
                    // Batch upsert
                    const { error: pushError } = await supabase
                        .from('study_logs')
                        .upsert(itemsToPush, { onConflict: 'user_id, item_id' });

                    if (pushError) console.error('Failed to push updates:', pushError);
                }
            }
        }),
        {
            name: 'j-learning-history',
        }
    )
);
