'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </AuthProvider>
    );
}
