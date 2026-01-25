'use client';

import { useState } from 'react';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { Target, Zap, Keyboard, Grid3X3, ArrowLeft, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Game imports
import { QuizGame } from './QuizGame';
import { MatchingGame } from './MatchingGame';
import { TypingGame } from './TypingGame';
import { MemoryGame } from './MemoryGame';

type GameMode = 'hub' | 'quiz' | 'matching' | 'typing' | 'memory';

interface GameInfo {
    id: GameMode;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    minWords: number;
}

const GAMES: GameInfo[] = [
    {
        id: 'quiz',
        title: '4지선다 퀴즈',
        description: '단어를 보고 정답을 선택하세요',
        icon: Target,
        color: 'from-indigo-500 to-purple-500',
        minWords: 4,
    },
    {
        id: 'matching',
        title: '스피드 매칭',
        description: '단어와 뜻을 빠르게 연결하세요',
        icon: Zap,
        color: 'from-amber-500 to-orange-500',
        minWords: 4,
    },
    {
        id: 'typing',
        title: '타이핑 챌린지',
        description: '제한 시간 안에 뜻을 입력하세요',
        icon: Keyboard,
        color: 'from-emerald-500 to-teal-500',
        minWords: 1,
    },
    {
        id: 'memory',
        title: '카드 뒤집기',
        description: '같은 짝을 찾아 매칭하세요',
        icon: Grid3X3,
        color: 'from-pink-500 to-rose-500',
        minWords: 4,
    },
];

export function GameHub() {
    const [currentGame, setCurrentGame] = useState<GameMode>('hub');
    const { getBookmarkedItems } = useLearningHistory();

    const bookmarkedWords = getBookmarkedItems();
    const wordCount = bookmarkedWords.length;

    const handleGameSelect = (game: GameInfo) => {
        if (wordCount >= game.minWords) {
            setCurrentGame(game.id);
        }
    };

    const handleBack = () => {
        setCurrentGame('hub');
    };

    // Render selected game
    if (currentGame === 'quiz') {
        return <QuizGame words={bookmarkedWords} onBack={handleBack} />;
    }
    if (currentGame === 'matching') {
        return <MatchingGame words={bookmarkedWords} onBack={handleBack} />;
    }
    if (currentGame === 'typing') {
        return <TypingGame words={bookmarkedWords} onBack={handleBack} />;
    }
    if (currentGame === 'memory') {
        return <MemoryGame words={bookmarkedWords} onBack={handleBack} />;
    }

    // Hub view
    return (
        <div className="max-w-2xl mx-auto py-8 px-4 pb-40 lg:pb-12">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">단어 게임</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    나만의 단어장으로 재미있게 학습하세요!
                </p>
            </div>

            {/* Word count info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">나만의 단어장</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-300">
                        {wordCount > 0 ? `${wordCount}개 단어로 게임 가능` : '단어를 먼저 저장하세요'}
                    </p>
                </div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {wordCount}
                </div>
            </div>

            {/* Games grid */}
            <div className="grid grid-cols-2 gap-4">
                {GAMES.map((game) => {
                    const isLocked = wordCount < game.minWords;
                    const Icon = game.icon;

                    return (
                        <button
                            key={game.id}
                            onClick={() => handleGameSelect(game)}
                            disabled={isLocked}
                            className={cn(
                                "relative p-6 rounded-2xl text-left transition-all duration-200 group",
                                isLocked
                                    ? "bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-800 hover:shadow-xl hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
                            )}
                        >
                            {/* Icon */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                                isLocked ? "from-gray-400 to-gray-500" : game.color
                            )}>
                                {isLocked ? (
                                    <Lock className="w-6 h-6 text-white" />
                                ) : (
                                    <Icon className="w-6 h-6 text-white" />
                                )}
                            </div>

                            {/* Title & Description */}
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                {game.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {isLocked ? `${game.minWords}개 이상 필요` : game.description}
                            </p>

                            {/* Lock badge */}
                            {isLocked && (
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        잠김
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tip */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 단어 암기에서 <span className="font-bold text-indigo-600 dark:text-indigo-400">별표 버튼</span>을 눌러 나만의 단어장에 추가하세요!
                </p>
            </div>
        </div>
    );
}
