
import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './icons/ResultIcons';

interface AllergyManagerProps {
    isOpen: boolean;
    onClose: () => void;
    allergies: string[];
    onAddAllergy: (allergy: string) => void;
    onRemoveAllergy: (allergy: string) => void;
}

const AllergyManager: React.FC<AllergyManagerProps> = ({ isOpen, onClose, allergies, onAddAllergy, onRemoveAllergy }) => {
    const [newAllergy, setNewAllergy] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setNewAllergy('');
        }
    }, [isOpen]);

    const handleAdd = () => {
        onAddAllergy(newAllergy.trim());
        setNewAllergy('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md m-4 p-6 bg-slate-200/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-300/50 dark:border-red-500/30 shadow-2xl dark:shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-red-400 [text-shadow:0_0_10px_theme(colors.red.500)]">إدارة الحساسية</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                        <XCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    أضف المكونات التي لديك حساسية منها. سيقوم التطبيق بتنبيهك عند العثور عليها في أي منتج.
                </p>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="مثال: جلوتين، لاكتوز..."
                        className="flex-grow bg-slate-50 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    >
                        إضافة
                    </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {allergies.length === 0 ? (
                         <p className="text-center text-gray-500 dark:text-gray-400 py-4">لا توجد حساسيات مضافة.</p>
                    ) : (
                        allergies.map((allergy, index) => (
                            <div key={index} className="flex justify-between items-center bg-slate-300/50 dark:bg-gray-800/60 p-2 rounded-md animate-fade-in">
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{allergy}</span>
                                <button
                                    onClick={() => onRemoveAllergy(allergy)}
                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                    aria-label={`إزالة ${allergy}`}
                                >
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllergyManager;
