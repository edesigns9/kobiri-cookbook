import { useState, useCallback, useEffect, useMemo } from 'react';

// Check for vendor-prefixed SpeechRecognition API
const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

/**
 * A custom hook to manage speech synthesis (text-to-speech) and speech recognition (speech-to-text).
 */
export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Lazily initialize SpeechRecognition only when the hook is used.
    // This prevents the entire app from crashing on startup if the API is not available.
    const recognition = useMemo(() => {
        if (!SpeechRecognitionAPI) return null;
        const instance = new SpeechRecognitionAPI();
        instance.continuous = false; // Stop listening after a single utterance
        instance.lang = 'en-US';
        instance.interimResults = false;
        instance.maxAlternatives = 1;
        return instance;
    }, []);

    const populateVoiceList = useCallback(() => {
        if (!window.speechSynthesis) return;
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length === 0) return;

        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
        setVoices(englishVoices);

        // Use functional update to avoid dependency on selectedVoice
        setSelectedVoice(currentVoice => {
            if (currentVoice || englishVoices.length === 0) {
                return currentVoice;
            }
            // Smart default selection: Prefer a high-quality, local, female voice.
            return englishVoices.find(v => v.name.includes('Google') && v.name.includes('Female')) ||
                   englishVoices.find(v => v.name.includes('Female')) ||
                   englishVoices.find(v => v.localService) ||
                   englishVoices[0];
        });
    }, []);
    
    useEffect(() => {
        // `getVoices` is sometimes asynchronous, so we need to listen for the 'voiceschanged' event.
        populateVoiceList();
        window.speechSynthesis.addEventListener('voiceschanged', populateVoiceList);
        
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', populateVoiceList);
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if(recognition) {
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onend = null;
                recognition.abort();
            }
        };
    }, [populateVoiceList, recognition]);
    
    /**
     * Speaks the given text using the browser's synthesis engine and the selected voice.
     * @param text The text to be spoken.
     * @param onEnd A callback function to execute when speech has finished.
     */
    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onend = () => {
            if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utterance);
    }, [selectedVoice]);

    /**
     * Explicitly cancels any ongoing speech synthesis.
     */
    const cancelSpeech = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);
    
    const setVoice = useCallback((voiceURI: string) => {
        const voice = voices.find(v => v.voiceURI === voiceURI);
        if (voice) {
            setSelectedVoice(voice);
        }
    }, [voices]);

    /**
     * Starts listening for voice input from the user's microphone.
     */
    const startListening = useCallback(() => {
        if (!recognition || isListening) return;
        
        recognition.onresult = (event: any) => { // Use 'any' for broader compatibility
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => { // Use 'any'
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
             setIsListening(false);
        };

        setIsListening(true);
        setTranscript('');
        recognition.start();
    }, [isListening, recognition]);

    /**
     * Clears the transcript from the state.
     */
    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        speak,
        cancelSpeech,
        startListening,
        isListening,
        transcript,
        clearTranscript,
        isSpeechSupported: !!recognition && !!window.speechSynthesis,
        voices,
        selectedVoice,
        setVoice,
    };
};