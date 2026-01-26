export function playAudio(text: string, lang = 'ja-JP') {
    if (!window.speechSynthesis) return;

    // Stop any existing utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.volume = 1.0; // Ensure max volume

    // Attempt to load voices if empty (helpful for some browsers)
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            // Retry setting voice if needed, though strictly speak() might have already started with default.
        };
    }

    // Japanese voice preference
    // Prioritize Google Japanese, then any 'ja' voice
    const jaVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('ja'))
        || voices.find(v => v.lang.includes('ja'));

    if (jaVoice) utterance.voice = jaVoice;

    window.speechSynthesis.speak(utterance);
}
