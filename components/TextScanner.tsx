
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalyzeIcon } from './icons/AnalyzeIcon';

interface TextScannerProps {
    onAnalyzeClick: (text: string) => void;
    isLoading: boolean;
}

const TextScanner: React.FC<TextScannerProps> = ({ onAnalyzeClick, isLoading }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [detectedText, setDetectedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any | null>(null); // Using 'any' for TextDetector
    const animationFrameId = useRef<number | null>(null);
    const detectedLines = useRef<Set<string>>(new Set());

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        setIsScanning(false);
    }, []);

    const detectText = useCallback(async () => {
        if (!isScanning || !videoRef.current || !canvasRef.current || !detectorRef.current || videoRef.current.paused || videoRef.current.ended) {
            if (isScanning) {
                 animationFrameId.current = requestAnimationFrame(detectText);
            }
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const features = await detectorRef.current.detect(canvas);
            let newTextFound = false;
            if (features.length > 0) {
                for (const feature of features) {
                    if (feature.rawValue && !detectedLines.current.has(feature.rawValue)) {
                        detectedLines.current.add(feature.rawValue);
                        newTextFound = true;
                    }
                }
            }
            if (newTextFound) {
                setDetectedText(Array.from(detectedLines.current).join('\n'));
            }
        } catch (err) {
            console.error(err);
            setError('فشل في اكتشاف النص. قد لا يكون متصفحك مدعومًا بالكامل.');
            stopCamera();
        }

        animationFrameId.current = requestAnimationFrame(detectText);
    }, [isScanning, stopCamera]);


    const startCamera = useCallback(async () => {
        if (!('TextDetector' in window)) {
            setError('متصفحك لا يدعم اكتشاف النص المباشر. يرجى استخدام Google Chrome.');
            return;
        }

        stopCamera();
        setError(null);
        setDetectedText('');
        detectedLines.current.clear();
        

        try {
            if (!detectorRef.current) {
              detectorRef.current = new (window as any).TextDetector();
            }
            
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                await videoRef.current.play();
                setIsScanning(true);
                animationFrameId.current = requestAnimationFrame(detectText);
            }
        } catch (err) {
            console.error(err);
            setError('لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.');
            setIsScanning(false);
        }
    }, [stopCamera, detectText]);
    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleAnalyze = () => {
        stopCamera();
        onAnalyzeClick(detectedText);
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-6 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">مسح النص من الكاميرا</h2>
            <div className="w-full h-64 bg-black rounded-lg overflow-hidden relative border-2 border-dashed border-gray-400 dark:border-gray-600">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {!isScanning && !streamRef.current && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4 text-center">
                        <p>وجه الكاميرا نحو قائمة المكونات لبدء المسح.</p>
                    </div>
                )}
                 <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="w-full h-full opacity-50" style={{border: '4px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', borderRadius: '8px'}}></div>
                 </div>
            </div>

            <div className="flex w-full gap-2">
                <button onClick={isScanning ? stopCamera : startCamera} className={`w-full font-bold py-2 px-4 rounded-full transition-colors ${isScanning ? 'bg-red-500/80 text-white' : 'bg-teal-500 text-white'}`}>
                    {isScanning ? 'إيقاف المسح' : 'بدء المسح'}
                </button>
                <button onClick={() => { setDetectedText(''); detectedLines.current.clear(); }} disabled={!detectedText || isLoading} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50">
                    مسح النص
                </button>
            </div>
            
            <textarea
                value={detectedText}
                onChange={(e) => setDetectedText(e.target.value)}
                placeholder="...سيظهر النص الممسوح هنا. يمكنك تعديله قبل التحليل"
                className="w-full h-32 p-3 bg-slate-50 dark:bg-black/20 border border-gray-400 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                disabled={isLoading}
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button
                onClick={handleAnalyze}
                disabled={isLoading || !detectedText.trim()}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-xl shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px"
            >
                <AnalyzeIcon className="w-6 h-6"/>
                {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل'}
            </button>
        </div>
    );
};

export default TextScanner;
