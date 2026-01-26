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
    {
        results.map((item, idx) => {
            const mainWord = item.japanese[0]?.word || item.japanese[0]?.reading || item.slug;
            const reading = item.japanese[0]?.reading;
            const isCommon = item.is_common;
            const id = item.slug || `${mainWord}-${reading}`;
            const bookmarked = isBookmarked(id);

            return (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative">
                    {/* Save Button */}
                    <button
                        onClick={() => handleSave(item)}
                        className={cn(
                            "absolute top-6 right-6 p-2 rounded-full transition-all border",
                            bookmarked
                                ? "bg-amber-100 border-amber-200 text-amber-500 dark:bg-amber-900/20 dark:border-amber-800"
                                : "border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-gray-800"
                        )}
                        title={bookmarked ? "단어장에서 제거" : "나만의 단어장에 추가"}
                    >
                        <Star className={cn("w-5 h-5 transition-transform", bookmarked ? "fill-current" : "")} />
                    </button>

                    <div className="flex items-start justify-between mb-4 pr-12"> {/* Pr-12 for button space */}
                        <div>
                            <div className="flex items-baseline gap-3 mb-1">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                                    {mainWord}
                                </h3>
                                {reading && reading !== mainWord && (
                                    <span className="text-lg text-gray-500 font-medium">
                                        {reading}
                                    </span>
                                )}
                                <button
                                    onClick={() => playPronunciation(mainWord)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-teal-500 transition-colors"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
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
                        </div>
                    </div>

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
                </div>
            );
        })
    }
            </div >
        </div >
    );
}
