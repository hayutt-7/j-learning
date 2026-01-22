'use client';

import { exportToAnki, exportToCSV } from '@/lib/export';
import { Download, X, BookOpen, ALargeSmall } from 'lucide-react';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { cn } from '@/lib/utils';

interface LearningLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LearningLogModal({ isOpen, onClose }: LearningLogModalProps) {
    const { history } = useLearningHistory();
    const items = Object.values(history).sort((a, b) => b.lastSeenAt - a.lastSeenAt);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl dark:shadow-indigo-900/10 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">학습 기록</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            총 {items.length}개의 기록
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {items.length > 0 && (
                            <div className="flex gap-2 mr-2">
                                <button
                                    onClick={() => exportToCSV(items)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="CSV로 내보내기"
                                >
                                    <Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <button
                                    onClick={() => exportToAnki(items)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                                    title="Anki로 내보내기"
                                >
                                    <Download className="w-3.5 h-3.5" /> Anki
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            아직 학습 기록이 없습니다. 번역을 시작해보세요!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const Icon = item.type === 'grammar' ? BookOpen : ALargeSmall;
                                return (
                                    <div
                                        key={item.itemId}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 border border-gray-100 transition-colors"
                                    >
                                        <div className={cn(
                                            "p-2.5 rounded-lg shrink-0",
                                            item.type === 'grammar' ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate">
                                                    {item.text || item.itemId}
                                                </h3>
                                                {item.jlpt && (
                                                    <span className={cn(
                                                        "text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none",
                                                        item.jlpt === 'N1' ? "text-red-500 bg-red-50 border-red-100" :
                                                            item.jlpt === 'N2' ? "text-orange-500 bg-orange-50 border-orange-100" :
                                                                item.jlpt === 'N3' ? "text-yellow-600 bg-yellow-50 border-yellow-100" :
                                                                    "text-blue-500 bg-blue-50 border-blue-100"
                                                    )}>
                                                        {item.jlpt}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{item.meaning || '의미 없음'}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    {item.exposureCount}회 학습
                                                </span>
                                                <span>
                                                    최근 학습: {new Date(item.lastSeenAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {item.isMastered && (
                                            <div className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                                암기완료
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
