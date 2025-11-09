
import { useState, useEffect, useRef, useCallback } from 'react';

// Define the shape of the SpeechRecognition interface to avoid TypeScript errors.
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// FIX: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
// Using 'any' for window properties to bypass TypeScript's strict checks.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
}

export default function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('متصفحك لا يدعم التعرف على الصوت. جرب Chrome أو Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || 'ar-DZ';
    recognition.continuous = options.continuous || false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
      setIsListening(false); // Stop listening after final result for non-continuous mode
    };

    recognition.onerror = (event: any) => {
      let errorMessage = `خطأ في التعرف على الصوت: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = 'تم رفض الإذن بالوصول إلى الميكروفون.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'لم يتم اكتشاف أي كلام. حاول مرة أخرى.';
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [options.lang, options.continuous]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    hasSupport: !!SpeechRecognition,
  };
}
