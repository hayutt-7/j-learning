'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Supabase client automatically handles hash/query parsing for session
        // We just listen for the sign-in event or session availability
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session) {
                // Successful login
                router.replace('/');
            }
        });

        // Fallback check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">로그인 처리 중입니다...</p>
        </div>
    );
}
