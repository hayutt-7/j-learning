'use client';

import { useState, useEffect } from 'react';
import { Mic, Volume2, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';
import { playAudio } from '@/lib/audio-utils';

// Example Sentences Data (나중에는 DB에서 가져와야 함)
const SENTENCES = [
    { id: 1, text: 'こんにちは、元気ですか？', romaji: 'Konnichiwa, genki desu ka?', meaning: '안녕하세요, 잘 지내시나요?' },
    { id: 2, text: 'この近くにコンビニはありますか？', romaji: 'Kono chikaku ni konbini wa arimasu ka?', meaning: '이 근처에 편의점이 있나요?' },
    { id: 3, text: '日本のアニメが好きです。', romaji: 'Nihon no anime ga suki desu.', meaning: '일본 애니메이션을 좋아합니다.' },
    { id: 4, text: 'お会計をお願いします。', romaji: 'Okaikei o onegai shimasu.', meaning: '계산 부탁드립니다.' },
    { id: 5, text: '駅はどこですか？', romaji: 'Eki wa doko desu ka?', meaning: '역은 어디입니까?' },
];

export function SpeakingStudy() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState('');

    // Auto-advance logic could be added here
    const currentSentence = SENTENCES[currentIndex];

    // Helper to calculate similarity (Simple Word Match for prototype)
    const calculateScore = (target: string, spoken: string) => {
        // Remove spaces and punctuation for comparison
        const cleanTarget = target.replace(/[.,?？、。 ]/g, '');
        const cleanSpoken = spoken.replace(/[.,?？、。 ]/g, '');

        if (!cleanSpoken) return 0;

        // Simple overlap check
        let matchCount = 0;
        for (let i = 0; i < cleanTarget.length; i++) {
            if (cleanSpoken.includes(cleanTarget[i])) matchCount++;
        }

        let accuracy = Math.round((matchCount / cleanTarget.length) * 100);
        if (accuracy > 100) accuracy = 100;

        // Penalty for too much extra noise
        if (cleanSpoken.length > cleanTarget.length * 1.5) accuracy -= 10;

        return Math.max(0, accuracy);
    };

    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    } = useSpeechRecognition({
        language: 'ja-JP',
    });

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
            // Calculate score immediately on stop
            const finalScore = calculateScore(currentSentence.text, transcript + interimTranscript);
            setScore(finalScore);

            if (finalScore >= 80) setFeedback('완벽해요! 🎉');
            else if (finalScore >= 50) setFeedback('잘했어요! 조금만 더 정확하게 해볼까요?');
            else setFeedback('다시 한 번 시도해보세요!');

        } else {
            setScore(null);
            setFeedback('');
            resetTranscript();
            startListening();
        }
    };

    const handleNext = () => {
        resetTranscript();
        setScore(null);
        setFeedback('');
        setCurrentIndex((prev) => (prev + 1) % SENTENCES.length);
    };

    // Auto-stop silence detection could go here

    if (!isSupported) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                브라우저가 음성 인식을 지원하지 않습니다. (Chrome 권장)
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center min-h-[600px] justify-center">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-gray-400">SPEAKING MODE</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">
                    {currentIndex + 1} / {SENTENCES.length}
                </span>
            </div>

            {/* Target Card */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 mb-8 text-center relative overflow-hidden transition-all duration-300">

                {/* Score Overlay */}
                {score !== null && (
                    <div className="absolute top-4 right-4 animate-in zoom-in spin-in-12">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4 shadow-lg",
                            score >= 80 ? "bg-green-100 border-green-500 text-green-600" :
                                score >= 50 ? "bg-yellow-100 border-yellow-500 text-yellow-600" :
                                    "bg-red-100 border-red-500 text-red-600"
                        )}>
                            {score}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => playAudio(currentSentence.text)}
                    className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mb-6 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                    <Volume2 className="w-8 h-8" />
                </button>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-relaxed">
                    {currentSentence.text}
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    {currentSentence.romaji}
                </p>
                <p className="text-gray-400 text-sm">
                    {currentSentence.meaning}
                </p>
            </div>

            {/* User Input Area */}
            <div className="w-full relative mb-8">
                <div className={cn(
                    "w-full p-6 rounded-2xl min-h-[120px] flex items-center justify-center text-center transition-colors border-2",
                    isListening ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30" : "bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800"
                )}>
                    {transcript || interimTranscript ? (
                        <p className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                            {transcript}
                            <span className="text-gray-400">{interimTranscript}</span>
                        </p>
                    ) : (
                        <p className="text-gray-400">마이크 버튼을 누르고 따라 말해보세요</p>
                    )}
                </div>

                {feedback && (
                    <div className="absolute -bottom-8 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-2">
                        <p className={cn(
                            "font-bold",
                            score && score >= 80 ? "text-green-600" : "text-indigo-600"
                        )}>{feedback}</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={handleMicClick}
                    className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90",
                        isListening
                            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-200 dark:ring-red-900/30"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-1"
                    )}
                >
                    <Mic className={cn("w-8 h-8", isListening && "animate-bounce")} />
                </button>

                {score !== null && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 bottom-8 md:static flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm animate-in fade-in slide-in-from-left-4"
                    >
                        <span>다음 문장</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
