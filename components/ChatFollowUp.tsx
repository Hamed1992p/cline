
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/DetailIcons';
import { ChatMessage } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { MicrophoneIcon } from './icons/ActionIcons';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface ChatFollowUpProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

const ChatFollowUp: React.FC<ChatFollowUpProps> = ({ messages, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isListening, transcript, startListening, stopListening, hasSupport, error } = useSpeechRecognition({ lang: 'ar' });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (transcript) {
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        }
    }, [transcript]);


    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    
    const handleVoiceClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setInput('');
            startListening();
        }
    };

    return (
        <div className="mt-8 border-t border-slate-300 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-bold text-teal-500 dark:text-teal-400 mb-4 text-center [text-shadow:0_0_8px_var(--glow-color)]">
                لديك أسئلة أخرى؟ اسأل الذكاء الاصطناعي
            </h3>
            <div className="h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-300 dark:border-gray-700 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                           <div className="w-8 h-8 flex-shrink-0 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500/50">
                             <LogoIcon className="w-5 h-5 text-teal-400" />
                           </div>
                        )}
                        <div className={`max-w-md p-3 rounded-xl whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-slate-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}>
                           {msg.isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                           ) : msg.content }
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
                 {hasSupport && (
                    <button
                        onClick={handleVoiceClick}
                        className={`bg-slate-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold p-3 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isListening ? 'ring-2 ring-red-500' : ''}`}
                        aria-label={isListening ? 'إيقاف الاستماع' : 'بدء الاستماع الصوتي'}
                    >
                        <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                    </button>
                 )}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "جاري الاستماع..." : "...اسأل عن مكون معين أو بديل"}
                    className="flex-grow bg-slate-50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
                <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold p-3 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg"
                    aria-label="إرسال رسالة"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
             {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
    );
};

export default ChatFollowUp;
