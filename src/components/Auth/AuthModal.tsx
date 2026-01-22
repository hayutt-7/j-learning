'use client';

import { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccess(true);
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    onClose();
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isSignUp ? '회원가입' : '로그인'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                이메일을 확인해주세요
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {email}로 인증 링크를 보냈습니다.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    이메일
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    비밀번호
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-white transition-colors",
                                    loading
                                        ? "bg-indigo-400 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : isSignUp ? (
                                    '가입하기'
                                ) : (
                                    '로그인'
                                )}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                }}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {isSignUp
                                    ? '이미 계정이 있으신가요? 로그인'
                                    : '계정이 없으신가요? 회원가입'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
