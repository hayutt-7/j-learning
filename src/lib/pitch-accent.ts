// Pitch Accent 번역 매핑
const PITCH_ACCENT_KR: Record<string, string> = {
    // 일본어 원어
    '平板': '평판형',
    '頭高': '두고형',
    '中高': '중고형',
    '尾高': '미고형',

    // 영어
    'Heiban': '평판형',
    'Atamadaka': '두고형',
    'Nakadaka': '중고형',
    'Odaka': '미고형',

    // 소문자
    'heiban': '평판형',
    'atamadaka': '두고형',
    'nakadaka': '중고형',
    'odaka': '미고형',
};

/**
 * Pitch Accent를 한글로 변환
 * @param pitchAccent - 원본 pitch accent 문자열 (예: "Heiban", "平板", "Atamadaka" 등)
 * @returns 한글 번역 (예: "평판형", "두고형" 등)
 */
export function translatePitchAccent(pitchAccent: string): string {
    if (!pitchAccent) return '';

    // 직접 매핑이 있는 경우
    if (PITCH_ACCENT_KR[pitchAccent]) {
        return PITCH_ACCENT_KR[pitchAccent];
    }

    // 괄호 안에 포함된 경우 (예: "平板型 (Heiban)")
    const match = pitchAccent.match(/\((.*?)\)/);
    if (match) {
        const extracted = match[1];
        if (PITCH_ACCENT_KR[extracted]) {
            return PITCH_ACCENT_KR[extracted];
        }
    }

    // 여러 단어로 구성된 경우 각 단어를 변환
    const words = pitchAccent.split(/\s+/);
    const translated = words.map(word => {
        // 괄호 제거
        const clean = word.replace(/[()]/g, '');
        return PITCH_ACCENT_KR[clean] || clean;
    }).join(' ');

    // 변환된 것이 원본과 다르면 반환, 아니면 원본 그대로
    return translated !== pitchAccent ? translated : pitchAccent;
}

/**
 * JLPT 레벨을 한글 설명으로 변환
 */
export function getJLPTDescription(jlpt: string): string {
    const descriptions: Record<string, string> = {
        'N5': '초급',
        'N4': '초중급',
        'N3': '중급',
        'N2': '중상급',
        'N1': '상급',
    };
    return descriptions[jlpt] || jlpt;
}
