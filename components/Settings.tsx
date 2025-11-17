import React from 'react';
import { XCircleIcon } from './icons/ResultIcons';
import { SunIcon, MoonIcon, ContrastIcon } from './icons/ThemeIcons';
import { FeatherIcon } from './icons/ActionIcons';

// Reusable Toggle Switch Component
interface ToggleSwitchProps {
    label: string;
    description: string;
    icon: React.ReactNode;
    isChecked: boolean;
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, icon, isChecked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-black/20 rounded-lg">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-800">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
        <label htmlFor={label} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={label} className="sr-only peer" checked={isChecked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-slate-400 dark:peer-focus:ring-slate-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-slate-600 dark:peer-checked:bg-slate-500"></div>
        </label>
    </div>
);


interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
    isLiteMode: boolean;
    setIsLiteMode: (isLite: boolean) => void;
    isHighContrast: boolean;
    setIsHighContrast: (isHighContrast: boolean) => void;
    onClearHistory: () => void;
    onClearProfile: () => void;
    onClearAllergies: () => void;
    onResetAll: () => void;
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({
    isOpen,
    onClose,
    theme,
    setTheme,
    isLiteMode,
    setIsLiteMode,
    isHighContrast,
    setIsHighContrast,
    onClearHistory,
    onClearProfile,
    onClearAllergies,
    onResetAll,
    onLogout
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl h-[90vh] m-4 flex flex-col p-6 bg-slate-200/80 dark:bg-[#1e1b4b]/60 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-slate-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(100,116,139,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-300 [text-shadow:0_0_10px_theme(colors.slate.500)]">الإعدادات</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                    {/* Appearance Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">المظهر</h3>
                        <div className="space-y-2">
                            <ToggleSwitch
                                label="الوضع الداكن"
                                description={theme === 'dark' ? 'مفعل' : 'غير مفعل'}
                                icon={theme === 'dark' ? <MoonIcon className="w-5 h-5 text-slate-300"/> : <SunIcon className="w-5 h-5 text-yellow-500"/>}
                                isChecked={theme === 'dark'}
                                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            />
                            <ToggleSwitch
                                label="الوضع الخفيف"
                                description="إيقاف التأثيرات لزيادة الأداء"
                                icon={<FeatherIcon className="w-5 h-5 text-gray-500" />}
                                isChecked={isLiteMode}
                                onChange={() => setIsLiteMode(!isLiteMode)}
                            />
                            <ToggleSwitch
                                label="وضع التباين العالي"
                                description="تحسين الرؤية للمستخدمين"
                                icon={<ContrastIcon className="w-5 h-5 text-gray-500" />}
                                isChecked={isHighContrast}
                                onChange={() => setIsHighContrast(!isHighContrast)}
                            />
                        </div>
                    </section>

                    {/* Data Management Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">الحساب والبيانات</h3>
                        <div className="space-y-2">
                             <button onClick={onLogout} className="w-full text-left p-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                تسجيل الخروج
                             </button>
                             <button onClick={onClearHistory} className="w-full text-left p-3 bg-red-500/10 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-500/20 dark:hover:bg-red-900/40 transition-colors">
                                مسح سجل التحليلات
                             </button>
                             <button onClick={onClearProfile} className="w-full text-left p-3 bg-red-500/10 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-500/20 dark:hover:bg-red-900/40 transition-colors">
                                إعادة تعيين الملف الشخصي
                             </button>
                              <button onClick={onClearAllergies} className="w-full text-left p-3 bg-red-500/10 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold rounded-lg hover:bg-red-500/20 dark:hover:bg-red-900/40 transition-colors">
                                مسح قائمة الحساسية
                             </button>
                             <button onClick={onResetAll} className="w-full text-left p-3 mt-4 bg-red-600/80 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                                إعادة تعيين كل بيانات التطبيق
                             </button>
                        </div>
                    </section>
                    
                     {/* About Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">حول التطبيق</h3>
                        <div className="text-center p-4 bg-slate-100 dark:bg-black/20 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                            <p>Hamed AI - Version 1.0.0</p>
                            <p>تم التطوير بواسطة Hamed Ai &copy; 2024</p>
                            <a href="#" className="text-blue-500 hover:underline mt-2 inline-block">سياسة الخصوصية</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;