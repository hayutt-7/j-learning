export function playAudio(text: string, lang = 'ja-JP') {
    if (!window.speechSynthesis) return;

    // Stop any existing utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for learning

    // Japanese voice preference (if available)
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.includes('ja') || v.name.includes('Google 日本語'));
    if (jaVoice) utterance.voice = jaVoice;

    window.speechSynthesis.speak(utterance);
}
