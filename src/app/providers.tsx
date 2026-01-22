'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </AuthProvider>
    );
}
