'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { JLPTLevel, LearningItem } from '@/lib/types';
import { LevelSelector } from './LevelSelector';
import { VocabCard } from './VocabCard';
import { ArrowLeft, ChevronLeft, ChevronRight, Trophy, X, Zap, BookX, Flame, Settings, Eye, EyeOff, Filter, Star, Download } from 'lucide-react';
import { useUserProgress, XP_TABLE } from '@/hooks/useUserProgress';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { VOCAB_DATABASE } from '@/lib/vocabDatabase';

type CardStatus = 'know' | 'dont_know' | 'unseen';

interface SessionStats {
    totalXp: number;
    cardsStudied: number;
    correctCount: number;
    incorrectCount: number;
}

export function VocabStudy() {
    const [level, setLevel] = useState<JLPTLevel | null>(null);
    const [cards, setCards] = useState<LearningItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardStatuses, setCardStatuses] = useState<Map<string, CardStatus>>(new Map());
    const [sessionStats, setSessionStats] = useState<SessionStats>({ totalXp: 0, cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
    const [showExitModal, setShowExitModal] = useState(false);
    const [wrongWordsOnly, setWrongWordsOnly] = useState(false);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [showReading, setShowReading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    const { addXp, updateStreak } = useUserProgress();
    const { history, isBookmarked } = useLearningHistory(); // Get history to filter bookmarks

    const currentItem = cards[currentIndex];

    // Get bookmarked items from history
    const getBookmarkedItems = useCallback(() => {
        return Object.values(history).filter(item => isBookmarked(item.itemId)).map(historyItem => {
            // Convert history item back to LearningItem format roughly for the card
            return {
                id: historyItem.itemId,
                text: historyItem.text || '',
                type: historyItem.type || 'vocab',
                meaning: historyItem.meaning || '',
                explanation: "저장된 단어입니다.", // We might not have full explanation stored if came from partial data, but usually we do. 
                // Actually, useLearningHistory stores limited fields. 
                // If we want full richness, we'd need to fetch from DB or store full item.
                // For now, let's assume history has enough or minimal is ok.
                // Wait, useLearningHistory records minimal fields? 
                // Let's check recordExposures. It stores text, meaning, reading. 
                // It does NOT store 'explanation', 'examples' etc.
                // This is a problem for "My Vocab" full study.
                // Solution: We should rely on what we have, or maybe useLearningHistory SHOULD store more.
                // Prioritizing user request: "복습할 수 있게". Meaning/Text is MVP.
                reading: historyItem.reading,
                jlpt: historyItem.jlpt,
            } as LearningItem;
        });
    }, [history, isBookmarked]);

    const downloadAnkiCSV = () => {
        const items = getBookmarkedItems();
        if (items.length === 0) {
            alert("내보낼 단어가 없습니다. 먼저 단어를 저장해주세요!");
            return;
        }

        // CSV Header (Explicit for Anki: Front, Back)
        // Format: Text, Meaning <br> Reading <br> Type
        const csvContent = items.map(item => {
            const front = `"${item.text.replace(/"/g, '""')}"`;
            const back = `"${item.meaning.replace(/"/g, '""')}<br><small>${item.reading || ''}</small>"`;
            return `${front},${back}`;
        }).join('\n');

        // Add BOM for Excel/Anki UTF-8 compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `j-learning_anki_export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const startSession = useCallback((selected: JLPTLevel | 'BOOKMARKED') => {
        let pool: LearningItem[] = [];

        if (selected === 'BOOKMARKED') {
            pool = getBookmarkedItems();
            if (pool.length === 0) {
                alert("저장된 단어가 없습니다. 번역 결과에서 ★ 버튼을 눌러 단어를 저장해보세요!");
                return;
            }
        } else {
            pool = VOCAB_DATABASE[selected || 'N5'] || VOCAB_DATABASE['N5'];
        }

        // Shuffle the pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setLevel(selected as JLPTLevel); // Type casting for state
        setCurrentIndex(0);
        setCardStatuses(new Map());
        setSessionStats({ totalXp: 0, cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
    }, [getBookmarkedItems]);

    const handleResult = (result: 'know' | 'dont_know') => {
        if (!level || !currentItem) return;

        const isNew = !cardStatuses.has(currentItem.id);

        // Update status
        setCardStatuses(prev => new Map(prev).set(currentItem.id, result));

        if (isNew) {
            if (result === 'know') {
                const xp = XP_TABLE.VOCAB_CORRECT[level] || 10;
                addXp(xp);
                updateStreak();
                setSessionStats(prev => ({
                    ...prev,
                    totalXp: prev.totalXp + xp,
                    cardsStudied: prev.cardsStudied + 1,
                    correctCount: prev.correctCount + 1
                }));
            } else {
                setSessionStats(prev => ({
                    ...prev,
                    cardsStudied: prev.cardsStudied + 1,
                    incorrectCount: prev.incorrectCount + 1
                }));
            }
        }

        // Auto advance to next card after short delay
        if (autoAdvance && currentIndex < cards.length - 1) {
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showExitModal) return;

            switch (e.key) {
                case 'ArrowLeft':
                    goPrev();
                    break;
                case 'ArrowRight':
                    goNext();
                    break;
                case '1':
                case 'x':
                case 'X':
                    if (currentItem) handleResult('dont_know');
                    break;
                case '2':
                case 'o':
                case 'O':
                    if (currentItem) handleResult('know');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, cards.length, showExitModal, currentItem]);

    const goNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleExit = () => {
        if (sessionStats.cardsStudied > 0) {
            setShowExitModal(true);
        } else {
            setLevel(null);
        }
    };

    const confirmExit = () => {
        setShowExitModal(false);
        setLevel(null);
    };

    const currentStatus = currentItem ? cardStatuses.get(currentItem.id) : undefined;

    if (!level) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto px-4">
                <div className="w-full mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">단어장 선택</h2>
                    <p className="text-gray-500 dark:text-gray-400">학습할 레벨이나 모드를 선택해주세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Custom Vocab Button */}
                    <div className="relative group flex flex-col items-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-200 dark:border-amber-800 rounded-3xl shadow-lg hover:shadow-amber-500/20 transition-all hover:-translate-y-1">
                        <button
                            onClick={() => startSession('BOOKMARKED')}
                            className="w-full h-full p-8 flex flex-col items-center"
                        >
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4 group-hover:rotate-12 transition-transform">
                                <Star className="w-8 h-8 text-amber-500 fill-current" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">나만의 단어장</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
                                북마크한 단어 집중 복습
                            </p>
                            <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 backdrop-blur-sm">
                                Saved
                            </div>
                        </button>

                        {/* Anki Export Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); downloadAnkiCSV(); }}
                            className="absolute bottom-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-500 hover:text-green-600 hover:bg-white shadow-sm border border-transparent hover:border-green-200 transition-all"
                            title="Anki용 CSV 내보내기"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>

                    {/* JLPT Levels */}
                    <div className="grid grid-cols-2 gap-4">
                        {['N5', 'N4', 'N3', 'N2', 'N1'].map((jlpt) => (
                            <button
                                key={jlpt}
                                onClick={() => startSession(jlpt as JLPTLevel)}
                                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-indigo-200 transition-all group"
                            >
                                <span className="text-lg font-bold text-gray-400 group-hover:text-indigo-500 transition-colors">{jlpt}</span>
                                <span className="text-xs text-gray-400 mt-1">Level</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto h-full py-6">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-4 px-4">
                <button
                    onClick={handleExit}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm shadow-sm">
                        {level} 단어장
                    </span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {currentIndex + 1} / {cards.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-sm">+{sessionStats.totalXp}</span>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Wrong Words Filter Badge */}
            {wrongWordsOnly && (
                <div className="mb-3 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-xs font-bold flex items-center gap-1">
                    <Filter className="w-3 h-3" /> 오답만 보기 모드
                </div>
            )}

            {/* Card */}
            {currentItem && (
                <VocabCard item={currentItem} onResult={handleResult} showReading={showReading} />
            )}

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-6">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    이전
                </button>
                <button
                    onClick={goNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                >
                    다음
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1 mt-6 overflow-x-auto max-w-full px-4">
                {cards.map((card, idx) => {
                    const status = cardStatuses.get(card.id);
                    return (
                        <button
                            key={card.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                                ? 'bg-indigo-600 scale-125'
                                : status === 'know'
                                    ? 'bg-emerald-400'
                                    : status === 'dont_know'
                                        ? 'bg-red-400'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    );
                })}
            </div>

            {/* Exit Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-end">
                            <button onClick={() => setShowExitModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">학습 완료!</h3>
                            <div className="grid grid-cols-2 gap-4 my-6 text-center">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-3xl font-black text-indigo-600">+{sessionStats.totalXp}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">획득 XP</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{sessionStats.cardsStudied}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">학습 단어</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                    <p className="text-3xl font-black text-emerald-600">{sessionStats.correctCount}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">알아요</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                    <p className="text-3xl font-black text-red-500">{sessionStats.incorrectCount}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">몰라요</p>
                                </div>
                            </div>
                            <button
                                onClick={confirmExit}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">학습 설정</h3>
                            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    {showReading ? <Eye className="w-5 h-5 text-indigo-500" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                                    <span className="font-medium text-gray-900 dark:text-white">발음(읽기) 표시</span>
                                </div>
                                <button
                                    onClick={() => setShowReading(!showReading)}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${showReading ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${showReading ? 'left-6' : 'left-1'}`} />
                                </button>
                            </label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <ChevronRight className={`w-5 h-5 ${autoAdvance ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">자동 다음 카드</span>
                                </div>
                                <button
                                    onClick={() => setAutoAdvance(!autoAdvance)}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${autoAdvance ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoAdvance ? 'left-6' : 'left-1'}`} />
                                </button>
                            </label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Filter className={`w-5 h-5 ${wrongWordsOnly ? 'text-red-500' : 'text-gray-400'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">오답만 보기</span>
                                </div>
                                <button
                                    onClick={() => setWrongWordsOnly(!wrongWordsOnly)}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${wrongWordsOnly ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${wrongWordsOnly ? 'left-6' : 'left-1'}`} />
                                </button>
                            </label>
                        </div>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                        >
                            완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
