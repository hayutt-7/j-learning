'use client';

import { useState } from 'react';
import { Music, Search, Loader2, BookOpen, ListMusic, ArrowLeft } from 'lucide-react';
import { LearningItem } from '@/lib/types';
import { VocabCard } from '../Vocab/VocabCard';

interface SongInfo {
    title: string;
    artist: string;
    confirmed: boolean;
    sentences: string[];
    vocabItems: LearningItem[];
}

type StudyMode = 'search' | 'select' | 'sentence' | 'vocab';

export function SongStudy() {
    const [mode, setMode] = useState<StudyMode>('search');
    const [artist, setArtist] = useState('');
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [songInfo, setSongInfo] = useState<SongInfo | null>(null);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
    const [error, setError] = useState('');

    const searchSong = async () => {
        if (!artist.trim() && !title.trim()) {
            setError('가수명 또는 노래 제목을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/song', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artist: artist.trim(), title: title.trim() }),
            });

            if (!response.ok) throw new Error('노래를 찾을 수 없습니다.');

            const data = await response.json();
            setSongInfo(data);
            setMode('select');
        } catch (err) {
            setError('노래 정보를 가져올 수 없습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVocabResult = (result: 'know' | 'dont_know') => {
        if (!songInfo) return;
        if (currentVocabIndex < songInfo.vocabItems.length - 1) {
            setCurrentVocabIndex(prev => prev + 1);
        } else {
            setMode('select'); // Return to mode selection
        }
    };

    if (mode === 'search') {
        return (
            <div className="max-w-md mx-auto py-10 px-4">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Music className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">노래로 배우기</h1>
                    <p className="text-gray-500">좋아하는 일본 노래로 문법과 단어를 학습하세요</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">가수명</label>
                        <input
                            type="text"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="예: YOASOBI, Kenshi Yonezu..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">노래 제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 夜に駆ける, Lemon..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && searchSong()}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                    )}

                    <button
                        onClick={searchSong}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> 검색 중...</>
                        ) : (
                            <><Search className="w-5 h-5" /> 노래 찾기</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'select' && songInfo) {
        return (
            <div className="max-w-md mx-auto py-10 px-4">
                <button
                    onClick={() => setMode('search')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> 다른 노래 검색
                </button>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white mb-8 shadow-xl">
                    <p className="text-sm font-bold text-purple-200 mb-1">확인된 노래</p>
                    <h2 className="text-2xl font-black mb-1">{songInfo.title}</h2>
                    <p className="text-purple-100">{songInfo.artist}</p>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">학습 방법 선택</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => { setCurrentSentenceIndex(0); setMode('sentence'); }}
                        className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-colors text-left"
                    >
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <ListMusic className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">문장별 학습</p>
                            <p className="text-sm text-gray-500">가사 한 줄씩 분석하며 배우기</p>
                        </div>
                    </button>
                    <button
                        onClick={() => { setCurrentVocabIndex(0); setMode('vocab'); }}
                        className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-colors text-left"
                    >
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">단어/문법 카드</p>
                            <p className="text-sm text-gray-500">노래에 나오는 핵심 표현 암기</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'sentence' && songInfo) {
        const sentence = songInfo.sentences[currentSentenceIndex];
        return (
            <div className="max-w-md mx-auto py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setMode('select')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <span className="text-sm font-bold text-gray-500">
                        {currentSentenceIndex + 1} / {songInfo.sentences.length}
                    </span>
                    <div className="w-10" />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 mb-6 min-h-[200px] flex items-center justify-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white text-center break-keep leading-relaxed">
                        {sentence}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setCurrentSentenceIndex(Math.max(0, currentSentenceIndex - 1))}
                        disabled={currentSentenceIndex === 0}
                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl disabled:opacity-30"
                    >
                        이전
                    </button>
                    <button
                        onClick={() => {
                            if (currentSentenceIndex < songInfo.sentences.length - 1) {
                                setCurrentSentenceIndex(prev => prev + 1);
                            } else {
                                setMode('select');
                            }
                        }}
                        className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
                    >
                        {currentSentenceIndex === songInfo.sentences.length - 1 ? '완료' : '다음'}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'vocab' && songInfo && songInfo.vocabItems.length > 0) {
        const currentItem = songInfo.vocabItems[currentVocabIndex];
        return (
            <div className="max-w-lg mx-auto py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setMode('select')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <span className="text-sm font-bold text-gray-500">
                        {currentVocabIndex + 1} / {songInfo.vocabItems.length}
                    </span>
                    <div className="w-10" />
                </div>

                <VocabCard item={currentItem} onResult={handleVocabResult} />
            </div>
        );
    }

    return null;
}
