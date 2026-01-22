'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    contextText: string; // The translated text or context
}

export function ChatModal({ isOpen, onClose, contextText }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize with greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `"${contextText}"에 대해 무엇이든 물어보세요! 문법, 단어, 뉘앙스 등 자세히 설명해 드릴게요.`
            }]);
        }
    }, [isOpen, contextText, messages.length]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Use existing translate action but we will need a new action for pure chat in future.
            // For now, let's create a server action for chat.
            // Wait, we need to create it first. Let's assume we update actions.ts

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    context: contextText,
                    history: messages
                })
            });

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "죄송합니다. 오류가 발생했습니다." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            {/* Modal */}
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl shadow-2xl h-[80vh] sm:h-[600px] pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom border dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">AI Tutor</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about grammar, words..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white dark:placeholder:text-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
