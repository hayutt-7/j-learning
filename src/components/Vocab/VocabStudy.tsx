'use client';

import { useState, useCallback } from 'react';
import { JLPTLevel, LearningItem } from '@/lib/types';
import { LevelSelector } from './LevelSelector';
import { VocabCard } from './VocabCard';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useUserProgress, XP_TABLE } from '@/hooks/useUserProgress';

// Mock data generator for now - in production this would verify against DB or API
const MOCK_VOCAB_DB: Record<string, LearningItem[]> = {
    'N5': [
        { id: 'v1', text: '猫', reading: 'ねこ', meaning: '고양이', type: 'vocab', jlpt: 'N5', explanation: '' },
        { id: 'v2', text: '犬', reading: 'いぬ', meaning: '개', type: 'vocab', jlpt: 'N5', explanation: '' },
        { id: 'v3', text: '学生', reading: 'がくせい', meaning: '학생', type: 'vocab', jlpt: 'N5', explanation: '' },
        { id: 'v4', text: '食べる', reading: 'たべる', meaning: '먹다', type: 'vocab', jlpt: 'N5', explanation: '' },
        { id: 'v5', text: '広い', reading: 'ひろい', meaning: '넓다', type: 'vocab', jlpt: 'N5', explanation: '' },
    ],
    // Fill other levels with minimal placeholders to prevent errors
    'N4': [{ id: 'v6', text: '会議', reading: 'かいぎ', meaning: '회의', type: 'vocab', jlpt: 'N4', explanation: '' }],
    'N3': [{ id: 'v7', text: '優勝', reading: 'ゆうしょう', meaning: '우승', type: 'vocab', jlpt: 'N3', explanation: '' }],
    'N2': [{ id: 'v8', text: '際して', reading: 'さいして', meaning: '~에 즈음하여', type: 'vocab', jlpt: 'N2', explanation: '' }],
    'N1': [{ id: 'v9', text: '疎通', reading: 'そつう', meaning: '소통', type: 'vocab', jlpt: 'N1', explanation: '' }],
};

export function VocabStudy() {
    const [level, setLevel] = useState<JLPTLevel | null>(null);
    const [currentItem, setCurrentItem] = useState<LearningItem | null>(null);
    const { addXp, updateStreak } = useUserProgress();
    const [streakCount, setStreakCount] = useState(0);

    const startSession = (selected: JLPTLevel) => {
        setLevel(selected);
        nextCard(selected);
    };

    const nextCard = useCallback((lvl: JLPTLevel) => {
        const pool = MOCK_VOCAB_DB[lvl || 'N5'] || MOCK_VOCAB_DB['N5'];
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        setCurrentItem(randomItem);
    }, []);

    const handleResult = (result: 'know' | 'dont_know') => {
        if (!level || !currentItem) return;

        if (result === 'know') {
            const xp = XP_TABLE.VOCAB_CORRECT[level] || 10;
            addXp(xp);
            updateStreak();
            setStreakCount(prev => prev + 1);
        } else {
            setStreakCount(0);
            // TODO: Save to 'Hard List' for review
        }

        // Animate out? For now just instant swap
        nextCard(level);
    };

    if (!level) {
        return <LevelSelector onSelect={startSession} />;
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto h-full py-8">
            <div className="flex items-center justify-between w-full mb-8 px-4">
                <button
                    onClick={() => setLevel(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white px-3 py-1 bg-white border border-gray-200 rounded-full text-sm shadow-sm">
                        {level} Study
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                    <Trophy className="w-5 h-5" />
                    <span>{streakCount}</span>
                </div>
            </div>

            {currentItem && (
                <VocabCard item={currentItem} onResult={handleResult} />
            )}
        </div>
    );
}
