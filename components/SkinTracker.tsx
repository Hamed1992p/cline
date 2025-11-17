import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SkinPhoto, SkinAnalysisReport, UserProfile } from '../types';
import { analyzeSkinProgress } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/ResultIcons';
import { SkinTrackerIcon } from './icons/ActionIcons';

interface SkinTrackerProps {
    profile: UserProfile;
    onClose: () => void;
}

const SkinTracker: React.FC<SkinTrackerProps> = ({ profile, onClose }) => {
    const [photos, setPhotos] = useState<SkinPhoto[]>(() => {
        const saved = localStorage.getItem('skinTrackerHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<SkinAnalysisReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem('skinTrackerHistory', JSON.stringify(photos));
    }, [photos]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhoto: SkinPhoto = {
                    id: new Date().toISOString(),
                    date: new Date().toLocaleDateString('ar-EG'),
                    image: reader.result as string,
                };
                setPhotos(prev => [newPhoto, ...prev]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectPhoto = (id: string) => {
        setSelectedPhotos(prev => {
            if (prev.includes(id)) {
                return prev.filter(photoId => photoId !== id);
            }
            return [...prev, id].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
        });
    };
    
    const handleAnalyze = useCallback(async () => {
        if (selectedPhotos.length < 2) {
            setError("الرجاء تحديد صورتين على الأقل للمقارنة.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const photosToAnalyze = photos
                .filter(p => selectedPhotos.includes(p.id))
                .sort((a,b) => new Date(a.id).getTime() - new Date(b.id).getTime())
                .map(p => {
                    const [meta, data] = p.image.split(',');
                    const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    return { data, mimeType };
                });

            const result = await analyzeSkinProgress(photosToAnalyze, profile);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError("حدث خطأ أثناء تحليل تقدم البشرة.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPhotos, photos, profile]);
    
    return (
        <div className="w-full max-w-3xl h-[90vh] flex flex-col mx-auto p-4 sm:p-6 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-pink-500/20 shadow-xl">
             <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-pink-400 [text-shadow:0_0_10px_theme(colors.pink.500)] flex items-center gap-2">
                    <SkinTrackerIcon className="w-7 h-7" />
                    متتبع حالة البشرة
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
                {/* Left Panel: Gallery & Actions */}
                <div className="flex flex-col gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="user" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-pink-100 dark:bg-pink-900/30 border-2 border-dashed border-pink-400 rounded-lg text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50">
                        <UploadIcon className="w-6 h-6" />
                        إضافة صورة جديدة
                    </button>
                    <div className="flex-grow bg-slate-100 dark:bg-black/20 rounded-lg p-2 overflow-y-auto">
                        {photos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map(p => (
                                    <div key={p.id} onClick={() => handleSelectPhoto(p.id)} className={`relative rounded-md overflow-hidden cursor-pointer aspect-square border-2 ${selectedPhotos.includes(p.id) ? 'border-pink-500' : 'border-transparent'}`}>
                                        <img src={p.image} alt={`Skin on ${p.date}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40"></div>
                                        <p className="absolute bottom-1 right-1 text-white text-xs drop-shadow-md">{p.date}</p>
                                        {selectedPhotos.includes(p.id) && <div className="absolute top-1 left-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center text-gray-500 p-4">لم تقم بإضافة أي صور بعد.</p>}
                    </div>
                    <button onClick={handleAnalyze} disabled={isLoading || selectedPhotos.length < 2} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-lg disabled:from-gray-500">
                        {isLoading ? "جاري التحليل..." : `تحليل التقدم (${selectedPhotos.length})`}
                    </button>
                </div>
                {/* Right Panel: Analysis Result */}
                <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-4 overflow-y-auto">
                     <h3 className="text-lg font-bold text-center text-gray-700 dark:text-gray-300 mb-2">تقرير التحليل</h3>
                     {analysisResult && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <h4 className="font-semibold text-pink-600 dark:text-pink-400">ملخص</h4>
                                <p className="text-sm">{analysisResult.summary}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-pink-600 dark:text-pink-400">ملاحظات</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">{analysisResult.observations.map((o,i)=><li key={i}>{o}</li>)}</ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-pink-600 dark:text-pink-400">توصيات</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">{analysisResult.recommendations.map((r,i)=><li key={i}>{r}</li>)}</ul>
                            </div>
                        </div>
                     )}
                     {!isLoading && !analysisResult && <p className="text-center text-gray-500 p-4">{error || "حدد صورتين على الأقل (الأقدم هي 'قبل' والأحدث هي 'بعد') ثم اضغط على تحليل."}</p>}
                     {isLoading && <p className="text-center text-gray-500 p-4">يقوم الذكاء الاصطناعي بمقارنة صورك...</p>}
                </div>
            </div>
        </div>
    );
};

export default SkinTracker;