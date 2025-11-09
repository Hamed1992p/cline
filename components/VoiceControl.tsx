
import React, { useEffect, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { VoiceCommandIcon } from './icons/ActionIcons';
import { XCircleIcon } from './icons/ResultIcons';

interface VoiceControlProps {
  onCommand: (command: string) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand }) => {
  const { isListening, transcript, startListening, hasSupport, error } = useSpeechRecognition({ lang: 'ar-DZ' });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (transcript) {
      onCommand(transcript);
    }
  }, [transcript, onCommand]);
  
  useEffect(() => {
      if(error){
          setShowError(true);
          const timer = setTimeout(() => setShowError(false), 5000);
          return () => clearTimeout(timer);
      }
  }, [error]);

  if (!hasSupport) {
    return null; // Don't render the button if the browser doesn't support the API
  }

  return (
    <>
      <button
        onClick={startListening}
        disabled={isListening}
        className={`fixed bottom-5 right-5 z-[100] w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${isListening 
                      ? 'bg-red-500 animate-pulse ring-red-400' 
                      : 'bg-gradient-to-br from-teal-500 to-cyan-600 ring-cyan-400 shadow-[0_0_20px_rgba(45,212,191,0.5)]'}`}
        aria-label="الأوامر الصوتية"
      >
        <VoiceCommandIcon className="w-8 h-8" />
      </button>
      {showError && (
          <div className="fixed bottom-24 right-5 z-[100] p-3 max-w-xs bg-red-600 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
             <XCircleIcon className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">{error}</p>
          </div>
      )}
    </>
  );
};

export default VoiceControl;
