import { useLearningHistory } from '@/hooks/useLearningHistory';
import { LearningItem } from '@/lib/types'; // Make sure this is imported at top
import { Star } from 'lucide-react'; // Make sure Star is imported

// ... (existing imports)

export function DictionaryStudy() {
    const { recordExposure, toggleBookmark, isBookmarked } = useLearningHistory();
    // ... (existing state)

    const handleSave = (item: JishoData) => {
        const mainWord = item.japanese[0]?.word || item.japanese[0]?.reading || item.slug;
        const reading = item.japanese[0]?.reading;

        // Create a unique ID for the dictionary item
        // Use slug if available, otherwise fallback to word+reading
        const id = item.slug || `${mainWord}-${reading}`;

        const learningItem: LearningItem = {
            id: id,
            text: mainWord,
            reading: reading || '',
            meaning: item.senses[0]?.english_definitions.join(', ') || 'No definition found',
            type: 'vocab',
            jlpt: item.jlpt?.[0]?.replace('jlpt-', 'N').toUpperCase() as any || undefined, // Approximate mapping
            // Store extra info if possible, or just keep it simple
            explanation: `From Dictionary Search: ${item.senses[0]?.parts_of_speech.join(', ')}`,
        };

        // If not in history (not bookmarked), add it first
        recordExposure(learningItem);
        toggleBookmark(id);
    };

    // ... (render)
    <span className="text-lg text-gray-500 font-medium">
        {reading}
    </span>
                                )
}
<button
    onClick={() => playPronunciation(mainWord)}
    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-teal-500 transition-colors"
>
    <Volume2 className="w-5 h-5" />
</button>
                            </div >
    <div className="flex flex-wrap gap-2">
        {isCommon && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">
                Common
            </span>
        )}
        {item.jlpt?.map((level, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-md">
                {level.replace('jlpt-', 'JLPT ')}
            </span>
        ))}
    </div>
                        </div >
                    </div >

    <div className="space-y-3">
        {item.senses.map((sense, sIdx) => (
            <div key={sIdx} className="text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm font-medium min-w-[1.5rem] mt-0.5">{sIdx + 1}.</span>
                    <div>
                        <div className="text-sm text-gray-500 mb-0.5 italic">
                            {sense.parts_of_speech.join(', ')}
                        </div>
                        <div className="leading-relaxed">
                            {sense.english_definitions.join('; ')}
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
                </div >
            );
        })
    }
            </div >
        </div >
    );
}
