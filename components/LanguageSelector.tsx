import React from 'react';

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3.75h.008v.008H12v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.875 4.875l1.125 1.125m2.25 2.25l1.125 1.125m-3.375 0l1.125-1.125m9-1.125l1.125 1.125M12 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M12 21H3.375c-.621 0-1.125-.504-1.125-1.125V6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v13.125c0 .621-.504 1.125-1.125 1.125H12z" />
    </svg>
);


interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
    { code: 'Arabic', name: 'العربية' },
    { code: 'English', name: 'الإنجليزية' },
    { code: 'French', name: 'الفرنسية' },
    { code: 'Spanish', name: 'الإسبانية' },
    { code: 'German', name: 'الألمانية' },
    { code: 'Chinese', name: 'الصينية' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
    return (
        <div className="w-full max-w-md mx-auto mb-6">
            <label htmlFor="language-select" className="flex items-center justify-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <GlobeIcon className="w-5 h-5" />
                لغة التحليل
            </label>
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-gray-600 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white appearance-none"
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
