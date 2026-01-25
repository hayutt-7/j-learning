'use client';

import { DailyStudyRecord } from '@/hooks/useStudyLog';

interface WeeklyChartProps {
    data: DailyStudyRecord[];
    dataKey?: 'wordsLearned' | 'xpEarned' | 'reviewsDone';
    color?: string;
}

export function WeeklyChart({ data, dataKey = 'wordsLearned', color = '#6366f1' }: WeeklyChartProps) {
    const maxValue = Math.max(...data.map(d => d[dataKey]), 1);

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-2 h-32">
                {data.map((record, idx) => {
                    const value = record[dataKey];
                    const height = (value / maxValue) * 100;
                    const dayIndex = new Date(record.date).getDay();
                    const isToday = record.date === new Date().toISOString().split('T')[0];

                    return (
                        <div key={record.date} className="flex-1 flex flex-col items-center gap-2">
                            {/* Bar */}
                            <div className="w-full flex flex-col items-center justify-end h-24">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">
                                    {value > 0 ? value : ''}
                                </span>
                                <div
                                    className="w-full max-w-8 rounded-t-lg transition-all duration-500 ease-out"
                                    style={{
                                        height: `${Math.max(height, 4)}%`,
                                        backgroundColor: isToday ? color : `${color}80`,
                                        boxShadow: isToday ? `0 0 12px ${color}40` : 'none',
                                    }}
                                />
                            </div>
                            {/* Day label */}
                            <span className={`text-xs font-bold ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {dayNames[dayIndex]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
