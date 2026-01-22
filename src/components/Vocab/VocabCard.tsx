'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LearningItem } from '@/lib/types';
import { Volume2, Check, X } from 'lucide-react';

interface VocabCardProps {
    item: LearningItem;
    onResult: (result: 'know' | 'dont_know') => void;
}

export function VocabCard({ item, onResult }: VocabCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const playAudio = (text: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto h-[500px] perspective-1000 relative">
            <div
                className={cn(
                    "relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer shadow-2xl rounded-3xl",
                    isFlipped ? "rotate-y-180" : ""
                )}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-between border-2 border-gray-100 dark:border-gray-700">
                    <div className="w-full flex justify-between items-start">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {item.jlpt || 'N5'}
                        </span>
                        <button
                            onClick={(e) => playAudio(item.text, e)}
                            className="p-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h2 className="text-5xl font-black text-gray-900 dark:text-white text-center break-keep leading-tight mb-2">
                            {item.text}
                        </h2>
                        <p className="text-sm font-medium text-gray-400">클릭하여 뒤집기</p>
                    </div>

                    <div className="w-full h-12" /> {/* Spacer */}
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl p-8 flex flex-col items-center justify-between border-2 border-indigo-100 dark:border-indigo-800">
                    <div className="w-full flex justify-center pt-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">MEANING</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {item.reading && (
                            <p className="text-xl text-indigo-500 font-bold mb-2">{item.reading}</p>
                        )}
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">
                            {item.text}
                        </h2>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 break-keep">
                            {item.meaning}
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); onResult('dont_know'); }}
                            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                        >
                            <X className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold">몰라요</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onResult('know'); }}
                            className="flex flex-col items-center justify-center py-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Check className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold">알아요</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
