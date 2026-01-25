'use client';

import { useState, useEffect, useRef } from 'react';
import { generateCrossword, CrosswordData, Clue, Cell } from '@/lib/crossword-generator';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { VOCAB_DATABASE } from '@/lib/vocabDatabase';
import { JLPTLevel, LearningItem } from '@/lib/types';
import { ArrowLeft, Trophy, RotateCcw, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useStudyLog } from '@/hooks/useStudyLog';

interface CrosswordGameProps {
    onBack: () => void;
}

export function CrosswordGame({ onBack }: CrosswordGameProps) {
    const [puzzle, setPuzzle] = useState<CrosswordData | null>(null);
    const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { getBookmarkedItems } = useLearningHistory();
    const dailyGoals = useDailyGoals();
    const studyLog = useStudyLog();

    // Hidden input for keyboard handling
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        setLoading(true);
        setError(null);
        setIsFinished(false);

        // 1. Get words (Mix bookmarks + Random N5-N3)
        const bookmarks = getBookmarkedItems();
        let pool = bookmarks.map(item => ({ word: item.reading || item.text, clue: item.meaning }));

        // Fill pool if not enough
        if (pool.length < 20) {
            const levels: JLPTLevel[] = ['N5', 'N4', 'N3'];
            const randomIndex = Math.floor(Math.random() * levels.length);
            const randomLevel = levels[randomIndex] || 'N5';
            const dbWords = VOCAB_DATABASE[randomLevel] || [];

            const randomAdd = dbWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 30)
                .map((item: LearningItem) => ({ word: item.reading || item.text, clue: item.meaning }));
            pool = [...pool, ...randomAdd];
        }

        // 2. Generate Puzzle
        // Retry a few times if generation fails
        let data: CrosswordData | null = null;
        for (let i = 0; i < 5; i++) {
            data = generateCrossword(pool);
            if (data) break;
        }

        if (data) {
            setPuzzle(data);
            // Create empty user grid matching puzzle size
            const empty = Array(data.height).fill(null).map(() => Array(data.width).fill(''));
            setUserGrid(empty);

            // Auto select first clue
            if (data.clues.length > 0) {
                const first = data.clues[0];
                setSelectedCell({ x: first.x, y: first.y });
                setDirection(first.direction);
            }
        } else {
            setError("퍼즐을 생성할 수 없습니다. 단어가 부족하거나 연결되지 않습니다.");
        }
        setLoading(false);
    };

    // Focus handling
    useEffect(() => {
        if (selectedCell && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedCell]);

    const handleCellClick = (x: number, y: number) => {
        if (isFinished) return;

        // If clicking same cell, toggle direction
        if (selectedCell?.x === x && selectedCell?.y === y) {
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setSelectedCell({ x, y });
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedCell || !puzzle || isFinished) return;

        const val = e.target.value;
        if (!val) return;

        const char = val.slice(-1); // Last char

        // Update grid
        const newGrid = [...userGrid];
        newGrid[selectedCell.y] = [...newGrid[selectedCell.y]];
        newGrid[selectedCell.y][selectedCell.x] = char;
        setUserGrid(newGrid);

        // Clear input
        e.target.value = '';

        // Check completion
        checkCompletion(newGrid, puzzle);

        // Move to next cell
        moveNext();
    };

    const moveNext = () => {
        if (!selectedCell || !puzzle) return;

        let nextX = selectedCell.x;
        let nextY = selectedCell.y;

        if (direction === 'across') {
            nextX++;
        } else {
            nextY++;
        }

        // Check if next is valid in grid
        if (nextY < puzzle.height && nextX < puzzle.width && puzzle.grid[nextY][nextX] !== null) {
            setSelectedCell({ x: nextX, y: nextY });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!selectedCell || !puzzle || isFinished) return;

        if (e.key === 'Backspace') {
            const newGrid = [...userGrid];
            newGrid[selectedCell.y][selectedCell.x] = '';
            setUserGrid(newGrid);

            // Move back
            let prevX = selectedCell.x;
            let prevY = selectedCell.y;
            if (direction === 'across') prevX--; else prevY--;

            if (prevX >= 0 && prevY >= 0 && puzzle.grid[prevY][prevX] !== null) {
                setSelectedCell({ x: prevX, y: prevY });
            }
        } else if (e.key === 'ArrowUp') {
            if (selectedCell.y > 0 && puzzle.grid[selectedCell.y - 1][selectedCell.x] !== null) setSelectedCell({ ...selectedCell, y: selectedCell.y - 1 });
        } else if (e.key === 'ArrowDown') {
            if (selectedCell.y < puzzle.height - 1 && puzzle.grid[selectedCell.y + 1][selectedCell.x] !== null) setSelectedCell({ ...selectedCell, y: selectedCell.y + 1 });
        } else if (e.key === 'ArrowLeft') {
            if (selectedCell.x > 0 && puzzle.grid[selectedCell.y][selectedCell.x - 1] !== null) setSelectedCell({ ...selectedCell, x: selectedCell.x - 1 });
        } else if (e.key === 'ArrowRight') {
            if (selectedCell.x < puzzle.width - 1 && puzzle.grid[selectedCell.y][selectedCell.x + 1] !== null) setSelectedCell({ ...selectedCell, x: selectedCell.x + 1 });
        } else if (e.key === ' ') {
            setDirection(d => d === 'across' ? 'down' : 'across');
        }
    };

    const checkCompletion = (grid: (string | null)[][], puzzleData: CrosswordData) => {
        let isCorrect = true;
        let isFull = true;

        for (let y = 0; y < puzzleData.height; y++) {
            for (let x = 0; x < puzzleData.width; x++) {
                if (puzzleData.grid[y][x] !== null) {
                    if (!grid[y][x]) isFull = false;
                    if (grid[y][x] !== puzzleData.grid[y][x]) isCorrect = false;
                }
            }
        }

        if (isFull && isCorrect) {
            setIsFinished(true);
            const wordCount = puzzleData.clues.length;
            dailyGoals.addWords(wordCount);
            studyLog.logStudy({ wordsLearned: wordCount });
        }
    };

    const activeClue = puzzle?.clues.find(c =>
        selectedCell &&
        c.direction === direction &&
        selectedCell.x >= c.x && selectedCell.x < c.x + (c.direction === 'across' ? c.length : 1) &&
        selectedCell.y >= c.y && selectedCell.y < c.y + (c.direction === 'down' ? c.length : 1)
    );

    if (loading) return <div className="flex h-full items-center justify-center">퍼즐 생성 중...</div>;
    if (error) return <div className="flex flex-col h-full items-center justify-center gap-4 text-center p-4">
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={startNewGame} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">다시 시도</button>
    </div>;
    if (!puzzle) return null;

    if (isFinished) {
        return (
            <div className="max-w-md mx-auto py-12 px-4 text-center">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl">
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">퍼즐 정복!</h2>
                    <p className="text-gray-500 mb-8">{puzzle.clues.length}개의 단어를 모두 맞추셨습니다.</p>
                    <button onClick={onBack} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl mb-3">메뉴로 돌아가기</button>
                    <button onClick={startNewGame} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl">새 퍼즐 풀기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-lg mx-auto p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">십자말풀이</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{puzzle.clues.length}단어</span>
                </div>
                <button onClick={startNewGame} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto flex items-center justify-center mb-6">
                <div
                    className="grid gap-[2px] bg-gray-300 p-[2px] rounded-lg shadow-lg select-none"
                    style={{ gridTemplateColumns: `repeat(${puzzle.width}, minmax(30px, 1fr))` }}
                >
                    {puzzle.grid.map((row, y) => row.map((char, x) => {
                        const isCell = char !== null;
                        const isSelected = selectedCell?.x === x && selectedCell?.y === y;
                        const isActiveWord = activeClue &&
                            x >= activeClue.x && x < activeClue.x + (activeClue.direction === 'across' ? activeClue.length : 1) &&
                            y >= activeClue.y && y < activeClue.y + (activeClue.direction === 'down' ? activeClue.length : 1);

                        // Find clue number to display
                        const clueNum = puzzle.clues.find(c => c.x === x && c.y === y)?.number;

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => isCell && handleCellClick(x, y)}
                                className={cn(
                                    "relative aspect-square flex items-center justify-center text-lg font-bold transition-colors cursor-pointer",
                                    !isCell ? "bg-transparent pointer-events-none" : "bg-white dark:bg-gray-800",
                                    isSelected ? "bg-indigo-500 text-white z-10 scale-105 rounded shadow-lg" :
                                        isActiveWord ? "bg-indigo-100 dark:bg-indigo-900/40" : ""
                                )}
                            >
                                {isCell && (
                                    <>
                                        {clueNum && <span className="absolute top-0.5 left-0.5 text-[8px] leading-none text-gray-400 font-normal">{clueNum}</span>}
                                        {userGrid[y][x]}
                                    </>
                                )}
                            </div>
                        );
                    }))}
                </div>
            </div>

            {/* Active Clue */}
            <div className="bg-indigo-600 dark:bg-indigo-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HelpCircle className="w-16 h-16" />
                </div>
                {activeClue ? (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                                {activeClue.direction === 'across' ? '가로' : '세로'} {activeClue.number}번
                            </span>
                            <span className="text-xs opacity-70">({activeClue.length}글자)</span>
                        </div>
                        <p className="text-lg font-bold leading-tight">{activeClue.question}</p>
                    </div>
                ) : (
                    <p className="text-center text-indigo-200">단어를 선택하세요</p>
                )}
            </div>

            {/* Hidden Input */}
            <input
                ref={inputRef}
                type="text"
                className="opacity-0 absolute top-0 left-0 h-0 w-0"
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
        </div>
    );
}
