


import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { AnalysisResponse, UserProfile, ScanHistoryItem, ChatMessage, ComparisonResponse, Routine, RoutineProduct, RoutineAnalysis, MedicationAnalysisResponse, MealAnalysisResponse } from './types';
import { analyzeProductImage, analyzeProductText, compareProducts, analyzeRoutine, analyzeMedicationImage, analyzeMealImage, ai } from './services/geminiService';
import { Chat } from '@google/genai';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { LogoIcon } from './components/icons/LogoIcon';
import ThemeToggleButton from './components/ThemeToggleButton';
import AllergyManager from './components/AllergyManager';
import { AllergyIcon } from './components/icons/AllergyIcon';
import { UserProfileIcon, HistoryIcon } from './components/icons/DetailIcons';
import { XCircleIcon, CheckCircleIcon } from './components/icons/ResultIcons';
import { KeyboardIcon, ScaleIcon, BarcodeIcon, RoutineIcon, MicrophoneIcon, LiveAnalysisIcon, ScanTextIcon, MedicationIcon, QuestionIcon, FutureIcon, MealIcon, FeatherIcon } from './components/icons/ActionIcons';
import { UploadIcon } from './components/icons/UploadIcon';
import BarcodeScanner from './components/BarcodeScanner';
import AudioRecorder from './components/AudioRecorder';
import LiveAnalysis from './components/LiveAnalysis';
import TextScanner from './components/TextScanner';
import VoiceControl from './components/VoiceControl';
import HomePage from './components/HomePage';
import MedicationAnalysisResult from './components/MedicationAnalysisResult';
import MealAnalysisResult from './components/MealAnalysisResult';
import StarfieldBackground from './components/StarfieldBackground';
import GeneralChat from './components/GeneralChat';
import Notification from './components/Notification';
import FutureFeaturesModal from './components/FutureFeaturesModal';
import InstallPWAButton from './components/InstallPWAButton';


const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

const DEFAULT_PROFILE: UserProfile = {
  skinType: '',
  dietaryPreferences: [],
  healthGoals: [],
  ethicalConcerns: []
};

const DEFAULT_ROUTINE: Routine = {
    morning: [],
    evening: []
};

// =================================================================================
// UserProfileManager Component
// =================================================================================
interface UserProfileManagerProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({ isOpen, onClose, profile, setProfile }) => {
    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleMultiSelectChange = (field: keyof UserProfile, value: string) => {
        const currentValues = (profile[field] as string[]) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        setProfile({ ...profile, [field]: newValues });
    };

    const options = {
        dietaryPreferences: ['نباتي', 'خالي من الغلوتين', 'كيتو', 'خالي من الألبان'],
        healthGoals: ['سكر أقل', 'بروتين عالي', 'عضوي', 'منخفض الصوديوم'],
        ethicalConcerns: ['لم يتم اختباره على الحيوانات', 'زيت نخيل مستدام', 'تجارة عادلة', 'صديق للبيئة']
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-lg m-4 p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-cyan-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(34,211,238,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-cyan-400 [text-shadow:0_0_10px_theme(colors.cyan.500)]">ملفي الشخصي</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    خصص تحليلاتك عن طريق إخبارنا بالمزيد عنك.
                </p>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع البشرة</label>
                        <select name="skinType" value={profile.skinType} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white">
                            <option value="">غير محدد</option>
                            <option value="عادية">عادية</option>
                            <option value="دهنية">دهنية</option>
                            <option value="جافة">جافة</option>
                            <option value="مختلطة">مختلطة</option>
                            <option value="حساسة">حساسة</option>
                        </select>
                    </div>
                     {Object.keys(options).map((key) => (
                        <div key={key}>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {key === 'dietaryPreferences' ? 'التفضيلات الغذائية' : key === 'healthGoals' ? 'الأهداف الصحية' : 'الاهتمامات الأخلاقية'}
                             </label>
                             <div className="grid grid-cols-2 gap-2">
                                {options[key as keyof typeof options].map(option => (
                                    <label key={option} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-gray-600 rounded-md px-3 py-2 cursor-pointer has-[:checked]:bg-cyan-500/20 has-[:checked]:border-cyan-500">
                                        <input type="checkbox"
                                            className="form-checkbox h-4 w-4 rounded text-cyan-600 bg-gray-700 border-gray-500 focus:ring-cyan-500"
                                            checked={(profile[key as keyof UserProfile] as string[]).includes(option)}
                                            onChange={() => handleMultiSelectChange(key as keyof UserProfile, option)}
                                        />
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                     ))}
                </div>
            </div>
        </div>
    );
};


// =================================================================================
// ScanHistory Component
// =================================================================================
interface ScanHistoryProps {
    history: ScanHistoryItem[];
    onSelect: (item: ScanHistoryItem) => void;
    onClear: () => void;
    onClose: () => void;
    onCompare: (item1: ScanHistoryItem, item2: ScanHistoryItem) => void;
    selectionMode?: boolean;
    onAddToRoutine?: (items: ScanHistoryItem[]) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onSelect, onClear, onClose, onCompare, selectionMode = false, onAddToRoutine }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleItemSelect = (id: string) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            }
            if (!selectionMode && prev.length >= 2) {
                 return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const handleCompareClick = () => {
        if (selectedItems.length === 2) {
            const item1 = history.find(item => item.id === selectedItems[0]);
            const item2 = history.find(item => item.id === selectedItems[1]);
            if (item1 && item2) {
                onCompare(item1, item2);
            }
        }
    };
    
    const handleAddToRoutineClick = () => {
        const itemsToAdd = history.filter(item => selectedItems.includes(item.id));
        if (onAddToRoutine) onAddToRoutine(itemsToAdd);
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 animate-fade-in" onClick={onClose}>
             <div className="w-full max-w-3xl h-[80vh] m-4 flex flex-col p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-teal-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(45,212,191,0.3)]" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-teal-400 [text-shadow:0_0_10px_theme(colors.teal.500)]">
                        {selectionMode ? 'اختر منتجات للروتين' : 'سجل التحليلات'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
                {history.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {history.map(item => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <div key={item.id} onClick={() => handleItemSelect(item.id)} className={`cursor-pointer group relative rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400'}`}>
                                        <img src={item.image} alt={item.analysis.اسم_المنتج} className="w-full h-40 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-black/50 transition-all duration-200" style={{ borderColor: isSelected ? 'rgb(34 211 238)' : '#fff'}}>
                                            {isSelected && <CheckCircleIcon className="w-5 h-5 text-cyan-400" />}
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-2 w-full">
                                            <h3 className="text-white font-semibold drop-shadow-md truncate">{item.analysis.اسم_المنتج}</h3>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-300">{item.date}</p>
                                                 {!selectionMode && <button onClick={(e) => { e.stopPropagation(); onSelect(item); }} className="text-xs bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">عرض</button>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                         <div className="mt-4 flex-shrink-0 flex gap-2">
                            {selectionMode ? (
                                <button onClick={handleAddToRoutineClick} disabled={selectedItems.length === 0} className="flex-grow bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-2 px-4 rounded-lg disabled:from-gray-500 disabled:to-gray-600">
                                    إضافة ({selectedItems.length}) منتجات
                                </button>
                            ) : (
                                <>
                                    <button onClick={handleCompareClick} disabled={selectedItems.length !== 2} className="flex-grow flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                                        <ScaleIcon className="w-5 h-5"/>
                                        مقارنة ({selectedItems.length}/2)
                                    </button>
                                    <button onClick={onClear} className="bg-red-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700/80 transition-colors">مسح السجل</button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">لا توجد تحليلات محفوظة.</p>
                    </div>
                )}
             </div>
        </div>
    );
};


// =================================================================================
// EngagingLoader Component
// =================================================================================
const EngagingLoader: React.FC<{isComparing?: boolean; isRoutine?: boolean; isBarcode?: boolean; isMedication?: boolean; isMeal?: boolean;}> = ({ isComparing = false, isRoutine = false, isBarcode = false, isMedication = false, isMeal = false }) => {
    const messages = isComparing ? [
        "جاري استرجاع تحليلات المنتجات...",
        "تحليل نقاط القوة والضعف...",
        "مقارنة المكونات الرئيسية...",
        "تخصيص التوصية لملفك الشخصي...",
        "إعداد تقرير المقارنة الخاص بك..."
    ] : isRoutine ? [
        "تحميل روتينك الحالي...",
        "تحليل التفاعلات بين المكونات...",
        "التحقق من التعارضات المحتملة...",
        "تحسين ترتيب التطبيق...",
        "إعداد تحليل روتينك الشخصي..."
    ] : isBarcode ? [
        "تم العثور على الباركود!",
        "البحث عن المنتج في قاعدة البيانات...",
        "جلب قائمة المكونات...",
        "إرسال المكونات للتحليل...",
        "لحظات قليلة من فضلك..."
    ] : isMedication ? [
        "جاري فحص صورة الدواء...",
        "التعرف على النص في النشرة...",
        "استخلاص المعلومات الطبية الأساسية...",
        "تلخيص دواعي الاستعمال والتحذيرات...",
        "إعداد تقرير معلومات الدواء..."
    ] : isMeal ? [
        "جاري فحص صورة وجبتك...",
        "التعرف على أصناف الطعام...",
        "تقدير السعرات الحرارية...",
        "تحليل المكونات الغذائية...",
        "مقارنة الوجبة بأهدافك الصحية...",
        "إعداد تقريرك الغذائي الشخصي..."
    ] : [
        "جاري مسح الصورة ضوئيًا...",
        "التعرف على قائمة المكونات...",
        "استشارة قواعد البيانات العلمية...",
        "التحقق من المواد المسببة للحساسية...",
        "تقييم الأثر البيئي للمنتج...",
        "وضع اللمسات الأخيرة على تقريرك الشخصي..."
    ];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 1500); // Faster interval for a snappier feel
        return () => clearInterval(interval);
    }, [messages]);

    return (
        <div className="w-full max-w-4xl p-4 sm:p-6 bg-slate-200/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-300/50 dark:border-gray-700/50 flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-center space-x-3 h-20">
                <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-lg text-gray-700 dark:text-teal-300 font-semibold transition-opacity duration-500">{message}</p>
        </div>
    );
};

// =================================================================================
// ManualInput Component
// =================================================================================
interface ManualInputProps {
    onAnalyzeClick: (text: string) => void;
    isLoading: boolean;
}
const ManualInput: React.FC<ManualInputProps> = ({ onAnalyzeClick, isLoading }) => {
    const [text, setText] = useState('');
    return (
        <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-6 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">أدخل المكونات يدويًا</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="مثال: Aqua, Glycerin, Sodium Hyaluronate..."
                className="w-full h-48 p-3 bg-slate-50 dark:bg-black/20 border border-gray-400 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                disabled={isLoading}
            />
            <button
                onClick={() => onAnalyzeClick(text)}
                disabled={isLoading || !text.trim()}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-xl shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px"
            >
                {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل'}
            </button>
        </div>
    );
};

// =================================================================================
// ComparisonResult Component
// =================================================================================
const ComparisonResult: React.FC<{ data: ComparisonResponse; onClose: () => void; }> = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl h-[90vh] m-4 flex flex-col p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-cyan-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(34,211,238,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-cyan-400 [text-shadow:0_0_10px_theme(colors.cyan.500)]">نتائج المقارنة</h2>
                     <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg border border-cyan-500/30">
                        <h3 className="text-lg font-bold text-cyan-500 mb-2">التوصية النهائية</h3>
                        <p className="text-gray-700 dark:text-gray-300">{data.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product 1 */}
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">{data.product1_name}</h3>
                            <div>
                                <h4 className="font-bold text-green-600 dark:text-green-400">الإيجابيات</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                    {data.product1_pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-600 dark:text-red-400">السلبيات</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                    {data.product1_cons.map((con, i) => <li key={i}>{con}</li>)}
                                </ul>
                            </div>
                        </div>
                        {/* Product 2 */}
                         <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">{data.product2_name}</h3>
                            <div>
                                <h4 className="font-bold text-green-600 dark:text-green-400">الإيجابيات</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                    {data.product2_pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-600 dark:text-red-400">السلبيات</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                    {data.product2_cons.map((con, i) => <li key={i}>{con}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-cyan-500">مقارنة تفصيلية</h3>
                        {data.detailed_comparison.map((point, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-black/20 p-3 rounded-lg">
                                <h4 className="font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">{point.feature}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm text-center">
                                    <p className="bg-slate-200 dark:bg-gray-800 p-2 rounded">{point.product1_value}</p>
                                    <p className="bg-slate-200 dark:bg-gray-800 p-2 rounded">{point.product2_value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

// =================================================================================
// RoutineManager & AnalysisResult Components (NEW)
// =================================================================================
// These components are large and would be better in their own files, but for simplicity are included here.

const RoutineAnalysisResult: React.FC<{ data: RoutineAnalysis; onClose: () => void; }> = ({ data, onClose }) => {
    // ... UI for displaying routine analysis ...
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl h-[90vh] m-4 flex flex-col p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-purple-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(168,85,247,0.3)]" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-400 [text-shadow:0_0_10px_theme(colors.purple.500)]">تحليل الروتين</h2>
                     <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {/* Score and Summary */}
                    <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg border border-purple-500/30">
                        <h3 className="text-lg font-bold text-purple-500 mb-2">التقييم العام للروتين: {data.overall_score}/100</h3>
                        <p className="text-gray-700 dark:text-gray-300">{data.overall_summary}</p>
                    </div>

                    {/* Conflicts */}
                    {data.conflicts.length > 0 && (
                        <div>
                            <h3 className="font-bold text-red-500 mb-2">التعارضات المحتملة</h3>
                            <div className="space-y-2">
                            {data.conflicts.map((c, i) => (
                                <div key={i} className="p-3 bg-red-500/10 dark:bg-red-900/30 rounded-lg border border-red-500/30">
                                    <p className="font-semibold">{c.product_1} + {c.product_2}</p>
                                    <p className="text-sm">{c.reason}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                    
                     {/* Suggested Order */}
                    <div>
                        <h3 className="font-bold text-purple-500 mb-2">الترتيب المقترح للاستخدام</h3>
                        <ol className="list-decimal list-inside space-y-1 p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
                            {data.suggested_order.map((p, i) => <li key={i}>{p}</li>)}
                        </ol>
                    </div>

                     {/* Suggestions */}
                    <div>
                        <h3 className="font-bold text-purple-500 mb-2">اقتراحات للتحسين</h3>
                         <ul className="list-disc list-inside space-y-1 p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
                            {data.enhancement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RoutineManager: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    routine: Routine;
    setRoutine: (routine: Routine) => void;
    onOpenHistory: (routineType: 'morning' | 'evening') => void;
    onAnalyze: (routineType: 'morning' | 'evening') => void;
}> = ({ isOpen, onClose, routine, setRoutine, onOpenHistory, onAnalyze }) => {
    if (!isOpen) return null;

    const removeProduct = (type: 'morning' | 'evening', productId: string) => {
        setRoutine({
            ...routine,
            [type]: routine[type].filter(p => p.id !== productId)
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl h-[90vh] m-4 flex flex-col p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-purple-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(168,85,247,0.3)]" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-400 [text-shadow:0_0_10px_theme(colors.purple.500)]">مدير روتين العناية بالبشرة</h2>
                     <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning Routine */}
                    <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
                        <h3 className="text-xl font-bold text-yellow-500 mb-4">الروتين الصباحي</h3>
                        <div className="space-y-2 mb-4 min-h-[200px]">
                            {routine.morning.map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover"/>
                                        <span className="text-sm font-semibold truncate">{p.name}</span>
                                    </div>
                                    <button onClick={() => removeProduct('morning', p.id)} className="text-red-500 hover:text-red-700"><XCircleIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => onOpenHistory('morning')} className="w-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/50 rounded-lg py-2 mb-2">إضافة منتج</button>
                        <button onClick={() => onAnalyze('morning')} disabled={routine.morning.length < 2} className="w-full bg-purple-600 text-white rounded-lg py-2 disabled:bg-gray-500">تحليل الروتين الصباحي</button>
                    </div>
                    {/* Evening Routine */}
                    <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
                         <h3 className="text-xl font-bold text-indigo-500 mb-4">الروتين المسائي</h3>
                        <div className="space-y-2 mb-4 min-h-[200px]">
                            {routine.evening.map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-slate-200 dark:bg-gray-800 p-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover"/>
                                        <span className="text-sm font-semibold truncate">{p.name}</span>
                                    </div>
                                    <button onClick={() => removeProduct('evening', p.id)} className="text-red-500 hover:text-red-700"><XCircleIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => onOpenHistory('evening')} className="w-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/50 rounded-lg py-2 mb-2">إضافة منتج</button>
                        <button onClick={() => onAnalyze('evening')} disabled={routine.evening.length < 2} className="w-full bg-purple-600 text-white rounded-lg py-2 disabled:bg-gray-500">تحليل الروتين المسائي</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// =================================================================================
// Main App Component
// =================================================================================
interface NotificationState {
  id: number;
  message: string;
  details?: string[];
  type: 'warning' | 'info' | 'success';
}

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  const [isLiteMode, setIsLiteMode] = useLocalStorage<boolean>('isLiteMode', false);
  const [allergies, setAllergies] = useLocalStorage<string[]>('userAllergies', []);
  const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', DEFAULT_PROFILE);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanHistoryItem[]>('scanHistory', []);
  const [routines, setRoutines] = useLocalStorage<Routine>('userRoutines', DEFAULT_ROUTINE);

  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRoutineManagerOpen, setIsRoutineManagerOpen] = useState(false);
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [inputMode, setInputMode] = useState<'home' | 'image' | 'text' | 'barcode' | 'voice' | 'live' | 'scan-text' | 'medication' | 'general-chat' | 'meal'>('home');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);

  const [isHistorySelectionMode, setIsHistorySelectionMode] = useState(false);
  const [activeRoutineType, setActiveRoutineType] = useState<'morning' | 'evening' | null>(null);
  const [isAnalyzingRoutine, setIsAnalyzingRoutine] = useState(false);
  const [routineAnalysisResult, setRoutineAnalysisResult] = useState<RoutineAnalysis | null>(null);
  
  const [isAnalyzingMedication, setIsAnalyzingMedication] = useState(false);
  const [medicationAnalysis, setMedicationAnalysis] = useState<MedicationAnalysisResponse | null>(null);

  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysisResponse | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const bodyClasses = ['transition-colors', 'duration-500'];
    bodyClasses.push(theme === 'dark' ? 'bg-indigo-950' : 'bg-slate-100');
    if (isLiteMode) {
        bodyClasses.push('lite-mode');
    }
    document.body.className = bodyClasses.join(' ');
  }, [theme, isLiteMode]);
  
  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };
  
  const addNotification = useCallback((message: string, type: 'warning' | 'info' | 'success', details?: string[]) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type, details }]);
  }, []);

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const checkForAllergens = useCallback((analysis: AnalysisResponse, userAllergies: string[]) => {
      if (!userAllergies || userAllergies.length === 0) return;

      const ingredients = [
          ...analysis.المكونات_السلبية,
          ...analysis.المكونات_المشكوك_فيها,
      ];

      const foundAllergens = new Set<string>();

      for (const ingredient of ingredients) {
          const arabicName = ingredient.الاسم_العربي.toLowerCase();
          const scientificName = ingredient.الاسم_العلمي_او_الإنجليزي?.toLowerCase() || '';

          const matchedAllergy = userAllergies.find(ua => {
              const lowerUa = ua.toLowerCase().trim();
              if (!lowerUa) return false;
              return arabicName.includes(lowerUa) || scientificName.includes(lowerUa);
          });
          
          if (matchedAllergy) {
              foundAllergens.add(matchedAllergy);
          }
      }

      if (foundAllergens.size > 0) {
          addNotification(
              "تنبيه حساسية!",
              'warning',
              Array.from(foundAllergens)
          );
      }
  }, [addNotification]);
  
  const processAnalysisResult = useCallback((result: AnalysisResponse, image?: string) => {
        setAnalysis(result);
        const newHistoryItem: ScanHistoryItem = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString('ar-EG'),
            image: image || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Use a placeholder
            analysis: result
        };
        setScanHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
        
        checkForAllergens(result, allergies);

        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: `أنت Hamed AI، مساعد ذكي جزائري. مهمتك هي الإجابة على أسئلة المستخدم حول تحليل المنتج الذي تم إجراؤه بالفعل. تحدث باللهجة الجزائرية البسيطة والمهذبة. كن متعاونًا وإيجابيًا، وقدم اقتراحات بديلة عند الطلب. لا تقدم نصائح طبية.` },
            history: [
                { role: 'user', parts: [{ text: `هذا هو تحليل المنتج: ${JSON.stringify(result)}. سأطرح أسئلة متابعة حول هذا المنتج.` }] },
                { role: 'model', parts: [{ text: "أكيد خويا/أختي، راني هنا. سقسي واش حبيت على هاذ المنتج." }] }
            ]
        });
        setChat(chatInstance);
        setChatMessages([{role: 'model', content: "أهلاً بك! كيف يمكنني مساعدتك بخصوص هذا المنتج؟"}]);
  }, [allergies, setScanHistory, checkForAllergens]);

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imageBase64) {
      setError('الرجاء تحديد صورة أولاً.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChat(null);
    setChatMessages([]);

    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await analyzeProductImage(base64Data, imageFile.type, allergies, profile);
      processAnalysisResult(result, imageBase64);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحليل الصورة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imageBase64, allergies, profile, processAnalysisResult]);

  const handleMedicationAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imageBase64) {
      setError('الرجاء تحديد صورة أولاً.');
      return;
    }
    setIsAnalyzingMedication(true);
    setError(null);
    setMedicationAnalysis(null);

    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await analyzeMedicationImage(base64Data, imageFile.type);
      setMedicationAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحليل معلومات الدواء. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzingMedication(false);
    }
  }, [imageFile, imageBase64]);

  const handleAnalyzeMeal = useCallback(async () => {
    if (!imageFile || !imageBase64) {
      setError('الرجاء تحديد صورة أولاً.');
      return;
    }
    setIsAnalyzingMeal(true);
    setError(null);
    setMealAnalysis(null);

    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await analyzeMealImage(base64Data, imageFile.type, profile);
      setMealAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحليل وجبتك. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzingMeal(false);
    }
  }, [imageFile, imageBase64, profile]);


  const handleTextAnalyzeClick = useCallback(async (text: string) => {
    if (!text.trim()) {
        setError('الرجاء إدخال قائمة المكونات.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChat(null);
    setChatMessages([]);

    try {
        const result = await analyzeProductText(text, allergies, profile);
        processAnalysisResult(result);
    } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تحليل النص. الرجاء المحاولة مرة أخرى.');
    } finally {
        setIsLoading(false);
    }
  }, [allergies, profile, processAnalysisResult]);
  
   const handleBarcodeScanned = useCallback(async (barcode: string) => {
        setInputMode('image');
        setIsBarcodeLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            if (!response.ok) throw new Error('Product not found in database.');
            
            const data = await response.json();
            if (data.status === 0) throw new Error(data.status_verbose);
            
            const ingredientsText = data.product.ingredients_text_ar || data.product.ingredients_text;
            if (!ingredientsText) throw new Error('No ingredient list found for this product.');
            
            const imageUrl = data.product.image_front_url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            const result = await analyzeProductText(ingredientsText, allergies, profile);
            
            if (result.اسم_المنتج === 'غير واضح' && data.product.product_name) {
                result.اسم_المنتج = data.product.product_name;
            }
            
            processAnalysisResult(result, imageUrl);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'فشل في جلب المنتج من الباركود.';
            setError(`خطأ: ${errorMessage}`);
        } finally {
            setIsBarcodeLoading(false);
        }
    }, [allergies, profile, processAnalysisResult]);


  const handleSendMessage = useCallback(async (message: string) => {
      if (!chat) return;
      setChatMessages(prev => [...prev, { role: 'user', content: message }, { role: 'model', content: '', isLoading: true }]);
      try {
          const result = await chat.sendMessageStream({ message });
          let text = '';
          for await (const chunk of result) {
              text += chunk.text;
              setChatMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: 'model', content: text, isLoading: true };
                  return newMessages;
              });
          }
          setChatMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'model', content: text, isLoading: false };
              return newMessages;
          });
      } catch (err) {
          console.error("Chat error:", err);
          setChatMessages(prev => [...prev.slice(0, -1), { role: 'model', content: 'عذرًا، حدث خطأ ما.', isLoading: false }]);
      }
  }, [chat]);

  const handleCompare = async (item1: ScanHistoryItem, item2: ScanHistoryItem) => {
    setIsHistoryOpen(false);
    setIsComparing(true);
    setError(null);
    try {
        const result = await compareProducts(item1.analysis, item2.analysis, profile, allergies);
        setComparisonResult(result);
    } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء مقارنة المنتجات.");
    } finally {
        setIsComparing(false);
    }
  };

  const handleOpenHistoryForRoutine = (routineType: 'morning' | 'evening') => {
      setActiveRoutineType(routineType);
      setIsHistorySelectionMode(true);
      setIsRoutineManagerOpen(false);
      setIsHistoryOpen(true);
  };
  
  const handleAddToRoutine = (items: ScanHistoryItem[]) => {
      if (!activeRoutineType) return;
      
      const newProducts: RoutineProduct[] = items.map(item => ({
          id: item.id,
          name: item.analysis.اسم_المنتج,
          image: item.image,
      }));
      
      setRoutines(prev => {
          const existingIds = new Set(prev[activeRoutineType].map(p => p.id));
          const filteredNewProducts = newProducts.filter(p => !existingIds.has(p.id));
          return {
            ...prev,
            [activeRoutineType]: [...prev[activeRoutineType], ...filteredNewProducts]
          }
      });
      
      setIsHistoryOpen(false);
      setIsHistorySelectionMode(false);
      setIsRoutineManagerOpen(true);
  };

 const handleAnalyzeRoutine = async (routineType: 'morning' | 'evening') => {
    const routineProducts = routines[routineType];
    if (routineProducts.length < 2) return;

    setIsAnalyzingRoutine(true);
    setIsRoutineManagerOpen(false);
    setError(null);

    try {
        const productAnalyses = routineProducts
            .map(p => scanHistory.find(h => h.id === p.id)?.analysis)
            .filter((a): a is AnalysisResponse => !!a);
        
        if (productAnalyses.length !== routineProducts.length) {
            throw new Error("لم يتم العثور على تحليل لبعض المنتجات في الروتين.");
        }

        const result = await analyzeRoutine(routineType === 'morning' ? 'الصباحي' : 'المسائي', productAnalyses, profile);
        setRoutineAnalysisResult(result);

    } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحليل الروتين.");
    } finally {
        setIsAnalyzingRoutine(false);
    }
 };


  const resetState = () => {
    setImageFile(null);
    setImageBase64(null);
    setIsLoading(false);
    setAnalysis(null);
    setError(null);
    setChat(null);
    setChatMessages([]);
    setInputMode('home');
    setMedicationAnalysis(null);
    setMealAnalysis(null);
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setImageBase64(item.image);
    setAnalysis(item.analysis);
    setIsHistoryOpen(false);
    // Re-initiate chat for the selected old item
    const chatInstance = ai.chats.create({ 
        model: 'gemini-2.5-flash',
        config: { systemInstruction: `أنت Hamed AI...` }, // Abridged for brevity
        history: [
          { role: 'user', parts: [{ text: `هذا هو تحليل المنتج: ${JSON.stringify(item.analysis)}.` }] },
          { role: 'model', parts: [{ text: "أكيد خويا/أختي، سقسي واش حبيت." }] }
        ]
    });
    setChat(chatInstance);
    setChatMessages([{role: 'model', content: `لقد عرضت تحليل "${item.analysis.اسم_المنتج}". كيف يمكنني المساعدة؟`}]);
  };
  
  const clearHistory = () => {
      if (window.confirm("هل أنت متأكد أنك تريد مسح كل سجل التحليلات؟ لا يمكن التراجع عن هذا الإجراء.")) {
          setScanHistory([]);
      }
  };

  const closeAllModals = () => {
    setIsAllergyModalOpen(false);
    setIsProfileModalOpen(false);
    setIsHistoryOpen(false);
    setIsRoutineManagerOpen(false);
    setComparisonResult(null);
    setRoutineAnalysisResult(null);
    setIsFutureModalOpen(false);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCaseCommand = command.toLowerCase().trim();
    console.log("Voice command received:", lowerCaseCommand);

    if (lowerCaseCommand.includes('اغلق') || lowerCaseCommand.includes('بلع')) {
        closeAllModals();
    } else if (lowerCaseCommand.includes('صورة') || lowerCaseCommand.includes('كاميرا')) {
        setInputMode('image');
    } else if (lowerCaseCommand.includes('امسح النص') || lowerCaseCommand.includes('سكان تيكست')) {
        setInputMode('scan-text');
    } else if (lowerCaseCommand.includes('نص') || lowerCaseCommand.includes('يدوي')) {
        setInputMode('text');
    } else if (lowerCaseCommand.includes('باركود')) {
        setInputMode('barcode');
    } else if (lowerCaseCommand.includes('صوت')) {
        setInputMode('voice');
    } else if (lowerCaseCommand.includes('مباشر') || lowerCaseCommand.includes('لايف')) {
        setInputMode('live');
    } else if (lowerCaseCommand.includes('دواء') || lowerCaseCommand.includes('تحليل دواء')) {
        setInputMode('medication');
    } else if (lowerCaseCommand.includes('وجبة') || lowerCaseCommand.includes('اكل')) {
        setInputMode('meal');
    } else if (lowerCaseCommand.includes('اسال حامد') || lowerCaseCommand.includes('اسأل حامد')) {
        setInputMode('general-chat');
    } else if (lowerCaseCommand.includes('سجل') || lowerCaseCommand.includes('هيستوري')) {
        setIsHistoryOpen(true);
    } else if (lowerCaseCommand.includes('ملفي') || lowerCaseCommand.includes('بروفايل')) {
        setIsProfileModalOpen(true);
    } else if (lowerCaseCommand.includes('حساسية') || lowerCaseCommand.includes('اليرجي')) {
        setIsAllergyModalOpen(true);
    } else if (lowerCaseCommand.includes('روتين')) {
        setIsRoutineManagerOpen(true);
    } else if (lowerCaseCommand.includes('الرئيسية') || lowerCaseCommand.includes('home')) {
        resetState();
    }
  };


  let content: ReactNode;
  const modes = [
    { id: 'image', icon: UploadIcon, label: 'منتج' },
    { id: 'medication', icon: MedicationIcon, label: 'دواء' },
    { id: 'meal', icon: MealIcon, label: 'وجبة' },
    { id: 'general-chat', icon: QuestionIcon, label: 'اسأل حامد' },
    { id: 'future', icon: FutureIcon, label: 'ميزات مستقبلية' },
    { id: 'scan-text', icon: ScanTextIcon, label: 'مسح النص' },
    { id: 'text', icon: KeyboardIcon, label: 'نص' },
    { id: 'barcode', icon: BarcodeIcon, label: 'باركود' },
    { id: 'voice', icon: MicrophoneIcon, label: 'صوتي' },
    { id: 'live', icon: LiveAnalysisIcon, label: 'مباشر' }
  ];

  if (isLoading || isComparing || isBarcodeLoading || isAnalyzingRoutine || isAnalyzingMedication || isAnalyzingMeal) {
      content = <EngagingLoader isComparing={isComparing} isRoutine={isAnalyzingRoutine} isBarcode={isBarcodeLoading} isMedication={isAnalyzingMedication} isMeal={isAnalyzingMeal} />;
  } else if (error) {
      content = (
          <div className="mt-6 p-4 bg-red-500/20 dark:bg-red-900/50 border-2 border-red-500/40 dark:border-red-700/80 rounded-lg text-center text-red-700 dark:text-red-300 shadow-lg dark:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <p className="font-semibold text-lg">خطأ</p>
              <p>{error}</p>
              <button onClick={() => { resetState(); setError(null); }} className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded-full">حاول مرة أخرى</button>
          </div>
      );
  } else if (analysis) {
      content = (
          <div className="w-full transition-all duration-500 ease-in-out animate-fade-in">
              <AnalysisResult data={analysis} allergies={allergies} chatMessages={chatMessages} onSendMessage={handleSendMessage} />
              <div className="text-center mt-8">
                  <button onClick={resetState} className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px">
                      تحليل منتج آخر
                  </button>
              </div>
          </div>
      );
  } else if (medicationAnalysis) {
      content = (
          <div className="w-full transition-all duration-500 ease-in-out animate-fade-in">
              <MedicationAnalysisResult data={medicationAnalysis} />
               <div className="text-center mt-8">
                  <button onClick={resetState} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg hover:shadow-2xl active:translate-y-px">
                      تحليل منتج آخر
                  </button>
              </div>
          </div>
      );
  } else if (mealAnalysis) {
      content = (
          <div className="w-full transition-all duration-500 ease-in-out animate-fade-in">
              <MealAnalysisResult data={mealAnalysis} />
               <div className="text-center mt-8">
                  <button onClick={resetState} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-lg hover:shadow-2xl active:translate-y-px">
                      تحليل وجبة أخرى
                  </button>
              </div>
          </div>
      );
  } else if (inputMode === 'home') {
      content = <HomePage
                    modes={modes}
                    onModeSelect={(modeId) => {
                        if (modeId === 'future') {
                            setIsFutureModalOpen(true);
                        } else {
                            setInputMode(modeId as any);
                        }
                    }}
                />;
  } else {
      content = (
        <div className="w-full max-w-2xl animate-fade-in">
             <div className="text-center mb-4">
                <button onClick={() => setInputMode('home')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors underline">
                    &larr; العودة إلى القائمة الرئيسية
                </button>
            </div>
            {inputMode === 'image' && (
                <ImageUploader 
                    onImageSelect={handleImageSelect}
                    onAnalyzeClick={handleAnalyzeClick}
                    imagePreviewUrl={imageBase64}
                    isLoading={isLoading}
                    hasImage={!!imageFile}
                    promptText="انقر هنا لرفع صورة"
                    subPromptText="أو التقط صورة للمكونات"
                />
            )}
            {inputMode === 'medication' && (
                 <ImageUploader 
                    onImageSelect={handleImageSelect}
                    onAnalyzeClick={handleMedicationAnalyzeClick}
                    imagePreviewUrl={imageBase64}
                    isLoading={isAnalyzingMedication}
                    hasImage={!!imageFile}
                    promptText="صورة علبة الدواء أو النشرة"
                    subPromptText="التقط صورة واضحة للنشرة الداخلية"
                />
            )}
            {inputMode === 'meal' && (
                 <ImageUploader 
                    onImageSelect={handleImageSelect}
                    onAnalyzeClick={handleAnalyzeMeal}
                    imagePreviewUrl={imageBase64}
                    isLoading={isAnalyzingMeal}
                    hasImage={!!imageFile}
                    promptText="صورة وجبتك الغذائية"
                    subPromptText="التقط صورة واضحة لتحليلها"
                />
            )}
            {inputMode === 'scan-text' && (
                <TextScanner
                    onAnalyzeClick={handleTextAnalyzeClick}
                    isLoading={isLoading}
                />
            )}
            {inputMode === 'text' && (
                <ManualInput
                    onAnalyzeClick={handleTextAnalyzeClick}
                    isLoading={isLoading}
                />
            )}
            {inputMode === 'barcode' && (
                <BarcodeScanner
                    onBarcodeScanned={handleBarcodeScanned}
                    onCancel={() => setInputMode('home')}
                />
            )}
            {inputMode === 'voice' && (
                <AudioRecorder
                    onAnalyzeClick={handleTextAnalyzeClick}
                    isLoading={isLoading}
                />
            )}
            {inputMode === 'live' && (
                <LiveAnalysis 
                    onCancel={() => setInputMode('home')} 
                    allergies={allergies}
                    profile={profile}
                />
            )}
             {inputMode === 'general-chat' && (
                <GeneralChat onCancel={() => setInputMode('home')} />
            )}
        </div>
      );
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col items-center p-4 selection:bg-teal-500 selection:text-white">
      <div className="fixed top-5 right-5 z-[101] w-full max-w-sm space-y-2">
          {notifications.map(n => (
              <Notification
                  key={n.id}
                  message={n.message}
                  details={n.details}
                  type={n.type}
                  onClose={() => removeNotification(n.id)}
              />
          ))}
      </div>
      {!isLiteMode && <StarfieldBackground />}
      {inputMode !== 'home' && (
          <header className="w-full max-w-4xl py-4 px-6 my-4 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-slate-300/30 dark:border-teal-500/20 rounded-2xl flex justify-between items-center shadow-lg dark:shadow-[0_0_30px_rgba(45,212,191,0.2)] animate-fade-in">
            <div className="flex items-center gap-2">
                <ThemeToggleButton theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                 <button onClick={() => setIsLiteMode(prev => !prev)} className={`p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors ${isLiteMode ? 'text-teal-500' : 'text-gray-500'}`} aria-label="الوضع الخفيف">
                    <FeatherIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setIsAllergyModalOpen(true)} className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-red-600 dark:text-red-400 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors relative" aria-label="إدارة الحساسية">
                    <AllergyIcon className="w-6 h-6" />
                    {allergies.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{allergies.length}</span>}
                </button>
                <button onClick={() => setIsRoutineManagerOpen(true)} className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-purple-600 dark:text-purple-400 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors" aria-label="روتين العناية بالبشرة">
                    <RoutineIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex flex-col items-center cursor-pointer" onClick={resetState}>
              <div className="flex items-center justify-center gap-3 group">
                <LogoIcon className="w-16 h-16 text-teal-600 dark:text-teal-400 [filter:drop-shadow(0_0_8px_theme(colors.teal.500))] transition-all duration-300 group-hover:[filter:drop-shadow(0_0_15px_theme(colors.teal.400))]" />
                <h1 className="text-5xl font-bold text-gray-800 dark:text-white transition-all duration-300 animate-[neon-flicker_4s_ease-in-out_infinite] group-hover:animate-none" style={{textShadow: `0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(45, 212, 191, 0.8), 0 0 20px rgba(45, 212, 191, 0.6), 0 0 40px rgba(45, 212, 191, 0.4), 0 0 80px rgba(45, 212, 191, 0.2)`}}>
                  hamed Ai
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Lens of Health & Beauty</p>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => setIsProfileModalOpen(true)} className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-cyan-600 dark:text-cyan-400 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors" aria-label="الملف الشخصي">
                    <UserProfileIcon className="w-6 h-6" />
                </button>
                <button onClick={() => setIsHistoryOpen(true)} className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-teal-600 dark:text-teal-400 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors relative" aria-label="سجل التحليلات">
                    <HistoryIcon className="w-6 h-6" />
                     {scanHistory.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">{scanHistory.length}</span>}
                </button>
            </div>
          </header>
      )}
      
      <main className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center">
        {content}
      </main>

      {inputMode !== 'home' && (
          <footer className="w-full max-w-4xl text-center py-4 mt-auto">
            <p className="text-gray-500 dark:text-gray-600 text-sm">تم التطوير بواسطة hamed Ai &copy; 2024</p>
          </footer>
      )}
        
      <AllergyManager isOpen={isAllergyModalOpen} onClose={() => setIsAllergyModalOpen(false)} allergies={allergies} onAddAllergy={(allergy) => setAllergies([...allergies, allergy])} onRemoveAllergy={(allergy) => setAllergies(allergies.filter(a => a !== allergy))} />
      <UserProfileManager isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={profile} setProfile={setProfile} />
      {isHistoryOpen && <ScanHistory history={scanHistory} onSelect={handleSelectHistoryItem} onClear={clearHistory} onClose={() => {setIsHistoryOpen(false); setIsHistorySelectionMode(false);}} onCompare={handleCompare} selectionMode={isHistorySelectionMode} onAddToRoutine={handleAddToRoutine} />}
      {comparisonResult && <ComparisonResult data={comparisonResult} onClose={() => setComparisonResult(null)} />}
      <RoutineManager isOpen={isRoutineManagerOpen} onClose={() => setIsRoutineManagerOpen(false)} routine={routines} setRoutine={setRoutines} onOpenHistory={handleOpenHistoryForRoutine} onAnalyze={handleAnalyzeRoutine} />
      {routineAnalysisResult && <RoutineAnalysisResult data={routineAnalysisResult} onClose={() => setRoutineAnalysisResult(null)} />}
      <FutureFeaturesModal isOpen={isFutureModalOpen} onClose={() => setIsFutureModalOpen(false)} />
      
      <VoiceControl onCommand={handleVoiceCommand} />
      <InstallPWAButton />
    </div>
  );
};

export default App;