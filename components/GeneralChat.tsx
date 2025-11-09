import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { createGeneralChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon } from './icons/DetailIcons';
import { LogoIcon } from './icons/LogoIcon';
import { MicrophoneIcon } from './icons/ActionIcons';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { XCircleIcon } from './icons/ResultIcons';

interface GeneralChatProps {
    onCancel: () => void;
}

const GeneralChat: React.FC<GeneralChatProps> = ({ onCancel }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('generalChatHistory');
            return saved ? JSON.parse(saved) : [{ role: 'model', content: "أهلاً بك! أنا حامد AI، مساعدك الصحي والتجميلي. اسألني أي شيء!" }];
        } catch (e) {
            return [{ role: 'model', content: "أهلاً بك! أنا حامد AI، مساعدك الصحي والتجميلي. اسألني أي شيء!" }];
        }
    });
    const [input, setInput] = useState('');
    const { isListening, transcript, startListening, stopListening, hasSupport, error } = useSpeechRecognition({ lang: 'ar' });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const history = messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        
        // Remove the initial welcome message from history sent to the model
        if (history.length > 0 && history[0].role === 'model') {
            history.shift(); 
        }

        const chatInstance = createGeneralChat(history);
        setChat(chatInstance);
        
        localStorage.setItem('generalChatHistory', JSON.stringify(messages));
        
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        localStorage.setItem('generalChatHistory', JSON.stringify(messages));
    }, [messages]);
    
    useEffect(() => {
        if (transcript) {
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        }
    }, [transcript]);

    const handleSend = useCallback(async (messageText: string) => {
        if (!chat || !messageText.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: messageText };
        const loadingMessage: ChatMessage = { role: 'model', content: '', isLoading: true };

        const currentMessages = [...messages, userMessage, loadingMessage];
        setMessages(currentMessages);
        setInput('');

        try {
            const result = await chat.sendMessageStream({ message: messageText });
            let text = '';
            for await (const chunk of result) {
                text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', content: text, isLoading: true };
                    return newMessages;
                });
            }
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', content: text, isLoading: false };
                return newMessages;
            });
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev.slice(0, -1), { role: 'model', content: 'عذرًا، حدث خطأ ما. حاول مرة أخرى.', isLoading: false }]);
        }
    }, [chat, messages]);
    
    const handleVoiceClick = () => {
        if (isListening) {
            stopListening();
        } else {
            setInput('');
            startListening();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend(input);
        }
    };
    
    return (
         <div className="w-full max-w-2xl h-[80vh] flex flex-col mx-auto p-4 sm:p-6 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-teal-400 [text-shadow:0_0_10px_theme(colors.teal.500)]">اسأل حامد</h2>
                <button onClick={onCancel} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </div>
            
             <div className="flex-grow h-full overflow-y-auto p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-300 dark:border-gray-700 space-y-4">
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

            <div className="mt-4 flex gap-2 flex-shrink-0">
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
                    placeholder={isListening ? "جاري الاستماع..." : "اكتب سؤالك هنا..."}
                    className="flex-grow bg-slate-50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
                <button
                    onClick={() => handleSend(input)}
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

export default GeneralChat;