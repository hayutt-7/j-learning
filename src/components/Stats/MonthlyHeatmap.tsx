'use client';

import { DailyStudyRecord } from '@/hooks/useStudyLog';
import { cn } from '@/lib/utils';

interface MonthlyHeatmapProps {
    data: DailyStudyRecord[];
}

export function MonthlyHeatmap({ data }: MonthlyHeatmapProps) {
    const maxValue = Math.max(...data.map(d => d.wordsLearned), 1);

    const getIntensity = (value: number): string => {
        if (value === 0) return 'bg-gray-100 dark:bg-gray-800';
        const ratio = value / maxValue;
        if (ratio < 0.25) return 'bg-emerald-200 dark:bg-emerald-900/40';
        if (ratio < 0.5) return 'bg-emerald-300 dark:bg-emerald-800/60';
        if (ratio < 0.75) return 'bg-emerald-400 dark:bg-emerald-700/80';
        return 'bg-emerald-500 dark:bg-emerald-600';
    };

    // Organize data into weeks (7 columns)
    const weeks: DailyStudyRecord[][] = [];
    let currentWeek: DailyStudyRecord[] = [];

    // Pad the beginning to align with day of week
    const firstDayOfWeek = new Date(data[0]?.date || new Date()).getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', wordsLearned: -1, minutesStudied: 0, xpEarned: 0, reviewsDone: 0 });
    }

    data.forEach((record) => {
        currentWeek.push(record);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="w-full">
            <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 pr-2">
                    {dayLabels.map((day, idx) => (
                        <div key={day} className="w-6 h-4 flex items-center justify-end">
                            {idx % 2 === 1 && (
                                <span className="text-[10px] text-gray-400">{day}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                            {week.map((record, dayIdx) => {
                                if (record.wordsLearned < 0) {
                                    return <div key={dayIdx} className="w-4 h-4" />;
                                }

                                const isToday = record.date === new Date().toISOString().split('T')[0];

                                return (
                                    <div
                                        key={record.date || dayIdx}
                                        className={cn(
                                            "w-4 h-4 rounded-sm transition-colors",
                                            getIntensity(record.wordsLearned),
                                            isToday && "ring-2 ring-indigo-500 ring-offset-1"
                                        )}
                                        title={`${record.date}: ${record.wordsLearned}개 학습`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-gray-400">적음</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/80" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
                </div>
                <span className="text-[10px] text-gray-400">많음</span>
            </div>
        </div>
    );
}
