'use client';

import { DailyStudyRecord } from '@/hooks/useStudyLog';
import { cn } from '@/lib/utils';

interface MonthlyHeatmapProps {
    data: DailyStudyRecord[];
}

export function MonthlyHeatmap({ data }: MonthlyHeatmapProps) {
    const maxValue = Math.max(...data.map(d => d.wordsLearned), 1);

    const getIntensity = (value: number): string => {
        if (value === 0) return 'bg-gray-200 dark:bg-gray-700';
        const ratio = value / maxValue;
        if (ratio < 0.25) return 'bg-emerald-300 dark:bg-emerald-800';
        if (ratio < 0.5) return 'bg-emerald-400 dark:bg-emerald-700';
        if (ratio < 0.75) return 'bg-emerald-500 dark:bg-emerald-600';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    // Simple grid layout - just show all 30 days in a wrapped grid
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="w-full space-y-4">
            {/* Heatmap Grid - 7 columns, wrap naturally */}
            <div className="grid grid-cols-7 gap-1.5">
                {/* Day headers */}
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 pb-1">
                        {day}
                    </div>
                ))}

                {/* Pad days to align with correct weekday */}
                {(() => {
                    const firstDate = data[0]?.date ? new Date(data[0].date) : new Date();
                    const startPadding = firstDate.getDay();
                    return Array(startPadding).fill(null).map((_, i) => (
                        <div key={`pad-${i}`} className="aspect-square" />
                    ));
                })()}

                {/* Actual data cells */}
                {data.map((record) => {
                    const isToday = record.date === today;
                    return (
                        <div
                            key={record.date}
                            className={cn(
                                "aspect-square rounded-md transition-all duration-200 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-indigo-400",
                                getIntensity(record.wordsLearned),
                                isToday && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                            )}
                            title={`${record.date}: ${record.wordsLearned}개 학습`}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">최근 30일 학습 기록</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">적음</span>
                    <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                    </div>
                    <span className="text-[10px] text-gray-400">많음</span>
                </div>
            </div>
        </div>
    );
}

