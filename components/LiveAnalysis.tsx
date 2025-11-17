
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { ai, generateLiveSystemInstruction } from '../services/geminiService';
import { UserProfile } from '../types';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import { MicrophoneIcon, LiveAnalysisIcon } from './icons/ActionIcons';
import { LogoIcon } from './icons/LogoIcon';
import { UserProfileIcon } from './icons/DetailIcons';


const FRAME_RATE = 2; // Send 2 frames per second
const JPEG_QUALITY = 0.7;

interface LiveAnalysisProps {
  onCancel: () => void;
  allergies: string[];
  profile: UserProfile;
}

type ConversationEntry = {
    role: 'user' | 'ai';
    text: string;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve((reader.result as string).split(',')[1]);
        } else {
          reject(new Error("Failed to read blob as base64."));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

const createAudioBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};

const LiveAnalysis: React.FC<LiveAnalysisProps> = ({ onCancel, allergies, profile }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error' | 'ended'>('idle');
  
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);


  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(console.error);
    }
    setStatus(prev => (prev === 'error' ? 'error' : 'ended'));
  }, []);
  
  useEffect(() => {
    if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversationHistory, userTranscript, aiTranscript]);


  const startLiveSession = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('connecting');
    setError(null);
    setConversationHistory([]);
    setUserTranscript('');
    setAiTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'environment' } });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      let nextStartTime = 0;
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      const sources = new Set<AudioBufferSourceNode>();

      const systemInstruction = generateLiveSystemInstruction(allergies, profile);

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const audioSource = inputAudioContextRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const audioBlob = createAudioBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                 if (session) session.sendRealtimeInput({ media: audioBlob });
              });
            };
            audioSource.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);

            const canvasEl = canvasRef.current!;
            const videoEl = videoRef.current!;
            const ctx = canvasEl.getContext('2d');
            
            frameIntervalRef.current = window.setInterval(() => {
              if (!ctx || videoEl.paused || videoEl.ended) return;
              canvasEl.width = videoEl.videoWidth;
              canvasEl.height = videoEl.videoHeight;
              ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
              canvasEl.toBlob(async (blob) => {
                if (blob) {
                  try {
                    const base64Data = await blobToBase64(blob);
                    await sessionPromiseRef.current?.then((session) => {
                      if (session) session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                    });
                  } catch(e) {
                      console.error("Error converting blob to base64:", e);
                  }
                }
              }, 'image/jpeg', JPEG_QUALITY);
            }, 1000 / FRAME_RATE);

            setStatus('live');
            setConversationHistory([{ role: 'ai', text: 'أهلاً بك! أنا حامد AI. وجّه الكاميرا نحو أي منتج واسألني ما تريد.' }]);

          },
          onmessage: async (message: LiveServerMessage) => {
            let currentInput = userTranscript;
            let currentOutput = aiTranscript;

            if (message.serverContent?.outputTranscription) {
              currentOutput += message.serverContent.outputTranscription.text;
              setAiTranscript(currentOutput);
            }
            if (message.serverContent?.inputTranscription) {
              currentInput += message.serverContent.inputTranscription.text;
              setUserTranscript(currentInput);
            }
            if (message.serverContent?.turnComplete) {
                const finalInput = currentInput.trim();
                const finalOutput = currentOutput.trim();
                
                setConversationHistory(prev => {
                    const newHistory = [...prev];
                    if (finalInput) newHistory.push({role: 'user', text: finalInput});
                    if (finalOutput) newHistory.push({role: 'ai', text: finalOutput});
                    return newHistory;
                });
              
              setUserTranscript('');
              setAiTranscript('');
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio) {
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => sources.delete(source));
              source.start(nextStartTime);
              nextStartTime = nextStartTime + audioBuffer.duration;
              sources.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setError('حدث خطأ أثناء الجلسة المباشرة. قد تحتاج إلى تحديث الصفحة.');
            setStatus('error');
            cleanup();
          },
          onclose: () => {
             cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction,
        },
      });
    } catch (err) {
      console.error(err);
      setError('لا يمكن الوصول إلى الكاميرا أو الميكروفون. يرجى التحقق من الأذونات.');
      setStatus('error');
    }
  }, [allergies, profile, cleanup]);
  
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const StatusIndicator = () => {
    switch (status) {
        case 'connecting':
            return <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-lg font-semibold"><div className="w-16 h-16 border-4 border-dashed border-white rounded-full animate-spin"></div><p className="mt-4">جاري الاتصال...</p></div>;
        case 'live':
             return <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600/80 text-white px-3 py-1.5 rounded-full text-sm font-bold"> <span className="relative flex h-3 w-3"> <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span> <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span> </span> مباشر </div>;
        case 'error':
             return <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-red-400 text-center p-4">{error}</div>;
        case 'ended':
             return <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-lg font-semibold">انتهت الجلسة</div>;
        default:
            return <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white"><LiveAnalysisIcon className="w-16 h-16 mb-2"/> <p>التحليل المباشر جاهز</p></div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-4">
        <div className="w-full flex flex-col md:flex-row gap-4">
            {/* Video Section */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className={`w-full aspect-square bg-black rounded-lg overflow-hidden relative border-2 transition-all duration-300 ${status === 'live' ? 'border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.5)]' : 'border-transparent'}`}>
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    <StatusIndicator />
                </div>
                <div className="flex gap-2">
                    {status !== 'live' && status !== 'connecting' ? (
                        <button onClick={startLiveSession} disabled={status === 'connecting'} className="flex-grow flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 disabled:opacity-50">
                            <MicrophoneIcon className="w-6 h-6"/>
                            {status === 'ended' ? 'بدء جلسة جديدة' : 'بدء الجلسة المباشرة'}
                        </button>
                    ) : (
                        <button onClick={cleanup} className="flex-grow flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105">
                            إنهاء الجلسة
                        </button>
                    )}
                     <button onClick={onCancel} className="text-sm bg-slate-400/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-full hover:bg-slate-400 dark:hover:bg-gray-600">
                        إلغاء
                    </button>
                </div>
            </div>
            
            {/* Chat Section */}
            <div className="w-full md:w-1/2 flex flex-col h-[60vh] md:h-auto bg-slate-100/50 dark:bg-black/20 rounded-lg p-3 border border-slate-300 dark:border-gray-700">
                <h3 className="text-lg font-bold text-center text-gray-700 dark:text-teal-400 mb-2 pb-2 border-b border-slate-300 dark:border-gray-600 flex-shrink-0">المحادثة المباشرة</h3>
                <div ref={chatHistoryRef} className="flex-grow overflow-y-auto space-y-4 p-2">
                    {conversationHistory.map((msg, index) => (
                         <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-teal-500/20 border border-teal-500/50'}`}>
                                {msg.role === 'user' ? <UserProfileIcon className="w-5 h-5 text-blue-400"/> : <LogoIcon className="w-5 h-5 text-teal-400"/>}
                            </div>
                            <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-gray-800 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {/* Live transcriptions */}
                     {userTranscript && (
                         <div className="flex items-start gap-2 flex-row-reverse">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20 border border-blue-500/50 animate-pulse">
                                <UserProfileIcon className="w-5 h-5 text-blue-400"/>
                             </div>
                             <div className="p-3 rounded-lg max-w-sm bg-blue-500/80 text-white/90 rounded-br-none italic">
                                 {userTranscript}
                             </div>
                         </div>
                     )}
                     {aiTranscript && (
                         <div className="flex items-start gap-2">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-500/20 border border-teal-500/50 animate-pulse">
                                 <LogoIcon className="w-5 h-5 text-teal-400"/>
                             </div>
                             <div className="p-3 rounded-lg max-w-sm bg-slate-200/80 dark:bg-gray-800/80 rounded-bl-none italic">
                                 {aiTranscript}
                             </div>
                         </div>
                     )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default LiveAnalysis;
