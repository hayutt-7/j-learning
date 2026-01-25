'use client';

import { SendHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
    onTranslate: (text: string) => void;
    isLoading: boolean;
}

export function InputArea({ onTranslate, isLoading }: InputAreaProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onTranslate(input);
            setInput('');
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [input]);

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-all focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-500">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="한국어로 입력하세요... (Enter로 전송)"
                    className="block w-full resize-none border-0 bg-transparent py-3 pl-4 pr-14 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 text-base leading-6 min-h-[48px] max-h-[150px]"
                    disabled={isLoading}
                    rows={1}
                />
                <div className="absolute bottom-2 right-2">
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-600 p-2.5 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        <SendHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </form>
    );
}

