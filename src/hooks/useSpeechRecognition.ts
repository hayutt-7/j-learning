import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionProps {
    language?: string; // e.g. 'ja-JP'
    onResult?: (transcript: string) => void;
    onError?: (error: any) => void;
}

export function useSpeechRecognition({ language = 'ja-JP', onResult, onError }: UseSpeechRecognitionProps = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Browser support check
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening even after pause
        recognition.interimResults = true; // Show real-time results
        recognition.lang = language;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => {
                    const newTranscript = prev + ' ' + final;
                    onResult?.(newTranscript.trim());
                    return newTranscript;
                });
                setInterimTranscript('');
            } else {
                setInterimTranscript(interim);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            onError?.(event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, onResult, onError]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript(''); // Clear previous
            setInterimTranscript('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Already started', e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    };
}
