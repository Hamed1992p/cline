
import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon } from './icons/ActionIcons';
import { AnalyzeIcon } from './icons/AnalyzeIcon';
// Note: Audio utility functions would ideally be imported from a shared file
// import { encode, decode, decodeAudioData } from '../utils/audioUtils';

interface AudioRecorderProps {
    onAnalyzeClick: (text: string) => void;
    isLoading: boolean;
}

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAnalyzeClick, isLoading }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Use a ref to hold the recognition object to avoid re-creating it on re-renders
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError("متصفحك لا يدعم التعرف على الصوت. جرب Chrome أو Edge.");
            return;
        }

        if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'ar-DZ';
            recognition.interimResults = false;
            recognitionRef.current = recognition;

            recognition.onresult = (event: any) => {
                let final_transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    }
                }
                if (final_transcript) {
                     setTranscribedText(prev => (prev ? prev + ' ' : '') + final_transcript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                let errorMessage = event.error;
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    errorMessage = 'تم رفض الإذن بالوصول إلى الميكروفون.';
                } else if (event.error === 'no-speech') {
                    errorMessage = 'لم يتم اكتشاف أي كلام. حاول مرة أخرى.';
                }
                setError(`حدث خطأ في التعرف على الصوت: ${errorMessage}`);
                setIsRecording(false);
            };
            
            recognition.onend = () => {
                // This event fires when speech recognition service has disconnected
                // We set isRecording to false to allow user to restart
                setIsRecording(false);
            };
        }

        // Cleanup function
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);


    const toggleRecording = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            setTranscribedText(''); 
            recognition.start();
            setIsRecording(true);
            setError(null);
        }
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-6 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">تحليل صوتي</h2>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 -mt-4">
                اضغط على الميكروفون وابدأ في قراءة قائمة المكونات.
            </p>
            
            <button onClick={toggleRecording} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500/80 animate-pulse' : 'bg-teal-500'}`} aria-label={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}>
                <MicrophoneIcon className="w-12 h-12 text-white" />
            </button>
            {isRecording && <p className="text-gray-700 dark:text-gray-300">جاري التسجيل... اضغط مرة أخرى للإيقاف.</p>}
            
            <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                placeholder="...سيظهر النص المكتوب هنا"
                className="w-full h-32 p-3 bg-slate-50 dark:bg-black/20 border border-gray-400 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                disabled={isLoading}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                onClick={() => onAnalyzeClick(transcribedText)}
                disabled={isLoading || !transcribedText.trim()}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-xl shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px"
            >
                <AnalyzeIcon className="w-6 h-6"/>
                {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل'}
            </button>
        </div>
    );
};

export default AudioRecorder;