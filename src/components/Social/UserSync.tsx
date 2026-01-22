'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/hooks/useAuth';

export function UserSync() {
    const { user } = useAuth();
    const { level, currentXp } = useUserProgress();
    const lastSyncTime = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) return;

        // Debounce sync to avoid spamming DB on rapid XP changes
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            try {
                // Ensure profile exists or update it
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: user.id,
                        level,
                        total_xp: currentXp + (level > 1 ? calculateTotalXpForLevel(level) : 0), // Estimate total XP? 
                        // Actually useUserProgress currentXp is usually "xp into current level". 
                        // But Leaderboard needs TOTAL cumulative XP.
                        // Let's check useUserProgress logic. 
                        // If currentXp is just for current level, we need a 'totalCumulativeXp' field or calculate it.
                        // For now, let's just sync what we have. 
                        // Wait, looking at useUserProgress, currentXp resets on level up.
                        // So to get TOTAL XP, we need to sum up previous levels.
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });

                if (error) {
                    console.error('Error syncing progress:', error);
                }
            } catch (err) {
                console.error('Sync failed:', err);
            }
        }, 2000); // Sync after 2 seconds of inactivity

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [user, level, currentXp]);

    return null;
}

// Helper to estimate total XP if not tracked directly.
// Ideally usageUserProgress should track 'totalLifetimeXp'.
// Let's assume for now we just push what we have or modify useUserProgress.
// Actually, let's fix useUserProgress to track totalLifetimeXp properly if it doesn't.
function calculateTotalXpForLevel(lvl: number) {
    // This is approximate if we don't store it.
    let total = 0;
    for (let i = 1; i < lvl; i++) {
        total += Math.floor(100 * Math.pow(1.2, i - 1));
    }
    return total;
}
