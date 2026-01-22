'use client';

import { JLPTLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface LevelSelectorProps {
    onSelect: (level: JLPTLevel) => void;
}

const LEVELS: { level: JLPTLevel; label: string; desc: string; color: string }[] = [
    { level: 'N5', label: 'N5 입문', desc: '기초 문법과 필수 단어', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
    { level: 'N4', label: 'N4 초급', desc: '일상 생활 회화 가능', color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
    { level: 'N3', label: 'N3 중급', desc: '다양한 상황 대응', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
    { level: 'N2', label: 'N2 상급', desc: '비즈니스 및 뉴스', color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' },
    { level: 'N1', label: 'N1 최상급', desc: '원어민 수준', color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' },
];

export function LevelSelector({ onSelect }: LevelSelectorProps) {
    return (
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">단어장 레벨 선택</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-center">
                학습하고 싶은 일본어 능력 시험(JLPT) 레벨을 선택해주세요.<br />
                선택한 레벨의 중요 단어가 랜덤으로 등장합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {LEVELS.map((item) => (
                    <button
                        key={item.level}
                        onClick={() => onSelect(item.level)}
                        className={cn(
                            "flex flex-col items-start p-6 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg text-left group",
                            item.color
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3 w-full justify-between">
                            <span className="text-2xl font-black tracking-tight">{item.level}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                        <p className="text-sm opacity-80 font-medium">{item.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
