'use client';

import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';

interface InputAreaProps {
    onTranslate: (text: string) => void;
    isLoading: boolean;
}

export function InputArea({ onTranslate, isLoading }: InputAreaProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onTranslate(input);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 transition-all focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-500">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="말하고 싶은 내용을 한국어로 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                    className="block w-full resize-none border-0 bg-transparent py-4 pl-4 pr-12 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-0 sm:text-lg sm:leading-7 h-32"
                    disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2">
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <SendHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </form>
    );
}
