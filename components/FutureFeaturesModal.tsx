
import React from 'react';
import { XCircleIcon } from './icons/ResultIcons';
import { FutureIcon } from './icons/ActionIcons';

// Simple placeholder icons for demonstration
const ReportIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
const EarthIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3s4.5 4.03 4.5 9a9.004 9.004 0 01-4.5 9z" />;
const PriceTagIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />;
const FaceWithDataIcon = () => <><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9V9.75zm6 0h.008v.008H15V9.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 19.5v-1.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 18v1.5m-18 0v.75a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-.75m-18 0h18" /></>;

interface FutureFeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-900/30 flex items-center justify-center border border-purple-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-500 dark:text-purple-400">
                {icon}
            </svg>
        </div>
        <div>
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


const FutureFeaturesModal: React.FC<FutureFeaturesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const features = [
        { icon: <FaceWithDataIcon />, title: "متتبع حالة البشرة", description: "التقط صورًا دورية لبشرتك لتتبع التغيرات وتحليل فعاليتها مع المنتجات المستخدمة." },
        { icon: <ReportIcon />, title: "تقارير أسبوعية مخصصة", description: "احصل على ملخص أسبوعي لاستخدامك للمنتجات ونصائح مخصصة بناءً على تحليلاتك." },
        { icon: <EarthIcon />, title: "تقييم الأثر البيئي", description: "اعرف مدى استدامة منتجاتك وتأثيرها على البيئة، من التعبئة والتغليف إلى المكونات." },
        { icon: <PriceTagIcon />, title: "مقارنة الأسعار والعروض", description: "ابحث عن أفضل الأسعار للمنتجات التي تحبها وبدائلها في المتاجر القريبة منك." },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl m-4 p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-purple-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(168,85,247,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-400 [text-shadow:0_0_10px_theme(colors.purple.500)] flex items-center gap-2">
                        <FutureIcon className="w-7 h-7" />
                        قادمون قريباً...
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    نحن نعمل باستمرار لتطوير Hamed AI. إليك لمحة عن الميزات المثيرة التي نخطط لها!
                </p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {features.map((feature, index) => (
                         <FeatureItem key={index} {...feature} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FutureFeaturesModal;
