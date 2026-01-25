'use client';

import { cn } from '@/lib/utils';

interface GoalProgressProps {
    progress: number; // 0-100
    label: string;
    current: number;
    goal: number;
    icon?: React.ReactNode;
    color?: string;
}

export function GoalProgress({ progress, label, current, goal, icon, color = '#6366f1' }: GoalProgressProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
    const isComplete = clampedProgress >= 100;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-100 dark:text-gray-800"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={isComplete ? '#10b981' : color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {icon && <div className="text-gray-400 mb-0.5">{icon}</div>}
                    <span className={cn(
                        "text-lg font-black",
                        isComplete ? "text-emerald-600" : "text-gray-900 dark:text-white"
                    )}>
                        {Math.round(clampedProgress)}%
                    </span>
                </div>
            </div>

            <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500">
                    {current} / {goal}
                </p>
            </div>
        </div>
    );
}

interface DailyGoalsSummaryProps {
    wordsProgress: number;
    minutesProgress: number;
    reviewsProgress: number;
    todayWords: number;
    todayMinutes: number;
    todayReviews: number;
    wordsGoal: number;
    minutesGoal: number;
    reviewsGoal: number;
}

export function DailyGoalsSummary({
    wordsProgress, minutesProgress, reviewsProgress,
    todayWords, todayMinutes, todayReviews,
    wordsGoal, minutesGoal, reviewsGoal
}: DailyGoalsSummaryProps) {
    const overallProgress = (wordsProgress + minutesProgress + reviewsProgress) / 3;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">오늘의 목표</h3>
                    <p className="text-sm text-gray-500">매일 조금씩 꾸준히!</p>
                </div>
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-bold",
                    overallProgress >= 100
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                )}>
                    {overallProgress >= 100 ? '🎉 완료!' : `${Math.round(overallProgress)}% 달성`}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <GoalProgress
                    progress={wordsProgress}
                    label="단어"
                    current={todayWords}
                    goal={wordsGoal}
                    color="#6366f1"
                />
                <GoalProgress
                    progress={minutesProgress}
                    label="학습 시간"
                    current={todayMinutes}
                    goal={minutesGoal}
                    color="#8b5cf6"
                />
                <GoalProgress
                    progress={reviewsProgress}
                    label="복습"
                    current={todayReviews}
                    goal={reviewsGoal}
                    color="#a855f7"
                />
            </div>
        </div>
    );
}
