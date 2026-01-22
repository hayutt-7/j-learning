'use client';

import { useLearningHistory } from '@/hooks/useLearningHistory';
import { X, Trophy, TrendingUp, Calendar, Activity } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { JLPTLevel } from '@/lib/types';

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
    const { history } = useLearningHistory();

    const stats = useMemo(() => {
        const items = Object.values(history);
        const total = items.length;
        const mastered = items.filter(i => i.isMastered).length;

        // JLPT Distribution
        const jlptCounts: Record<string, number> = { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0, Uncategorized: 0 };
        items.forEach(item => {
            const level = item.jlpt || 'Uncategorized';
            jlptCounts[level] = (jlptCounts[level] || 0) + 1;
        });

        // Today's Activity (Approximation using lastSeenAt)
        const today = new Date().setHours(0, 0, 0, 0);
        const studiedToday = items.filter(i => i.lastSeenAt >= today).length;

        return { total, mastered, jlptCounts, studiedToday };
    }, [history]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">학습 통계</h2>
                        <p className="text-sm text-gray-500">나의 학습 현황</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">암기 완료</span>
                            </div>
                            <p className="text-2xl font-bold text-indigo-900">{stats.mastered}</p>
                            <p className="text-xs text-indigo-400">개</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">전체 항목</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
                            <p className="text-xs text-emerald-400">개 학습함</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">오늘 학습</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">{stats.studiedToday}</p>
                            <p className="text-xs text-amber-400">개</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">연속 학습</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">3</p>
                            <p className="text-xs text-gray-400">일째</p>
                        </div>
                    </div>

                    {/* JLPT Breakdown */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">JLPT 분포</h3>
                        <div className="space-y-3">
                            {(['N1', 'N2', 'N3', 'N4', 'N5'] as const).map(level => {
                                const count = stats.jlptCounts[level] || 0;
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                return (
                                    <div key={level} className="flex items-center gap-3">
                                        <div className="w-8 text-sm font-bold text-gray-500">{level}</div>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    level === 'N1' ? "bg-red-500" :
                                                        level === 'N2' ? "bg-orange-500" :
                                                            level === 'N3' ? "bg-yellow-500" :
                                                                level === 'N4' ? "bg-blue-500" : "bg-indigo-500"
                                                )}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-12 text-right text-sm text-gray-600 font-medium">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
