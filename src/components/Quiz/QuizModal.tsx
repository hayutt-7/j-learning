'use client';

import { useState, useMemo } from 'react';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { X, CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningItem } from '@/lib/types';

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    // In a real app, we might fetch actual item data from a DB.
    // For this demo, we'll assume we have a way to look up item details 
    // or we'll perform a mock lookup based on ID.
    // For simplicity MVP, we will only quiz on items available in recent analysis context 
    // or we'll use a hardcoded fallback mapping if the store only saves IDs.
    // *Correction*: The store only saves IDs. We need a dictionary. 
    // TO KEEP IT SIMPLE: I will add a `knownItemsDictionary` usage or pass current items context.
    // Actually, for the persistent quiz to work properly without a backend, 
    // we need to adapt the store to save the text/meaning OR have a static dictionary.
    // Let's modify this to use a "Mock Dictionary" for the demo, 
    // or simple "Reverse Quiz" if we don't have meanings.
}

// MOCK DICTIONARY for demo purposes so Quiz works with the items we saw in MockAnalyzer
const DEMO_ITEMS_DB: Record<string, LearningItem> = {
    'vocab-konnichiwa': { id: 'vocab-konnichiwa', type: 'vocab', text: 'こんにちは', meaning: '안녕하세요', explanation: '' },
    'grammar-greeting': { id: 'grammar-greeting', type: 'grammar', text: '인사말', meaning: '기본 인사', explanation: '' },
    'vocab-arigatou-gozaimasu': { id: 'vocab-arigatou-gozaimasu', type: 'vocab', text: 'ありがとうございます', meaning: '감사합니다', explanation: '' },
    'grammar-masu': { id: 'grammar-masu', type: 'grammar', text: '~ます', meaning: '정중형 어미', explanation: '' },
    'vocab-demo': { id: 'vocab-demo', type: 'vocab', text: 'デモ', meaning: '데모', explanation: '' }
};

export function QuizModal({ isOpen, onClose }: QuizModalProps) {
    const { history } = useLearningHistory();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    // Generate questions from mastered items
    const questions = useMemo(() => {
        if (!isOpen) return [];

        // customizable to standard LearningItem
        const masteredIds = Object.values(history)
            .filter(h => h.isMastered)
            .map(h => h.itemId);

        if (masteredIds.length === 0) return [];

        // Create simple questions: "What is the meaning of [Text]?"
        // Shuffle and pick up to 5
        const quizItems = masteredIds
            .map(id => DEMO_ITEMS_DB[id])
            .filter(item => item !== undefined); // only items in our demo DB

        if (quizItems.length === 0) return [];

        return quizItems.slice(0, 5).map(item => {
            // Generate distractors
            const distractors = Object.values(DEMO_ITEMS_DB)
                .filter(d => d.id !== item.id)
                .map(d => d.meaning)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [...distractors, item.meaning].sort(() => 0.5 - Math.random());

            return {
                question: `"${item.text}"의 뜻은 무엇인가요?`,
                answer: item.meaning,
                options
            };
        });
    }, [isOpen, history]);

    if (!isOpen) return null;

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return; // prevent double click
        setSelectedAnswer(option);

        const isCorrect = option === questions[currentQuestionIndex].answer;
        if (isCorrect) setScore(s => s + 1);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        onClose();
    };

    if (questions.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">복습할 단어가 없어요</h3>
                    <p className="text-gray-500 mb-6">
                        아직 학습 완료(체크)한 단어가 없습니다.<br />
                        번역 결과에서 단어를 체크해보세요!
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {!showResult ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    Q.{currentQuestionIndex + 1}
                                </span>
                                <span>/ {questions.length}</span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center leading-relaxed">
                                {questions[currentQuestionIndex].question}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestionIndex].options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = option === questions[currentQuestionIndex].answer;
                                    const showCorrectness = selectedAnswer !== null;

                                    let buttonClass = "w-full p-4 rounded-xl border-2 text-left transition-all font-medium flex items-center justify-between group ";

                                    if (showCorrectness) {
                                        if (isCorrect) buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                                        else if (isSelected) buttonClass += "border-red-500 bg-red-50 text-red-700";
                                        else buttonClass += "border-gray-100 text-gray-400";
                                    } else {
                                        buttonClass += "border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={selectedAnswer !== null}
                                            className={buttonClass}
                                        >
                                            <span className="text-lg">{option}</span>
                                            {showCorrectness && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                            {showCorrectness && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <Trophy className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                        <p className="text-gray-500 mb-8 text-lg">
                            당신의 점수는 <span className="font-bold text-indigo-600">{score}</span> / {questions.length} 입니다.
                        </p>
                        <button
                            onClick={resetQuiz}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            Continue Learning <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { BookOpen } from 'lucide-react';
