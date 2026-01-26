'use client';

import { LearningItem } from '@/lib/types';
import { AnalysisCard } from './AnalysisCard';

interface ListViewProps {
    items: LearningItem[];
}

export function ListView({ items }: ListViewProps) {
    if (items.length === 0) return null;

    return (
        <div className="grid gap-4 animate-in fade-in duration-300">
            {items.map((item) => (
                <AnalysisCard key={item.id} item={item} />
            ))}
        </div>
    );
}
