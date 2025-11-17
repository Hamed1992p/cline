import React, { useState, useMemo } from 'react';
import { ScanHistoryItem } from '../types';
import { HistoryIcon } from './icons/DetailIcons';
import { SearchIcon } from './icons/SearchIcon';
import { XCircleIcon } from './icons/ResultIcons';

interface SearchProps {
    onClose: () => void;
    scanHistory: ScanHistoryItem[];
    searchHistory: string[];
    onSelectResult: (item: ScanHistoryItem) => void;
    onUpdateSearchHistory: (term: string) => void;
    onRemoveSearchHistoryItem: (term: string) => void;
}

const Search: React.FC<SearchProps> = ({ onClose, scanHistory, searchHistory, onSelectResult, onUpdateSearchHistory, onRemoveSearchHistoryItem }) => {
    const [query, setQuery] = useState('');

    const filteredResults = useMemo(() => {
        if (!query.trim()) return [];
        const lowerCaseQuery = query.toLowerCase();
        return scanHistory.filter(item => 
            item.analysis.اسم_المنتج.toLowerCase().includes(lowerCaseQuery)
        );
    }, [query, scanHistory]);

    const handleResultClick = (item: ScanHistoryItem) => {
        onUpdateSearchHistory(item.analysis.اسم_المنتج);
        onSelectResult(item);
    };

    const handleHistoryClick = (term: string) => {
        setQuery(term);
    };

    const renderContent = () => {
        if (query.trim()) {
            // Show search results
            if (filteredResults.length > 0) {
                return filteredResults.map(item => (
                    <li key={item.id} onClick={() => handleResultClick(item)} className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-slate-300/50 dark:hover:bg-black/20 transition-colors">
                        <img src={item.image} alt={item.analysis.اسم_المنتج} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.analysis.اسم_المنتج}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.analysis.العلامة_التجارية}</p>
                        </div>
                    </li>
                ));
            } else {
                return <li className="text-center p-4 text-gray-500 dark:text-gray-400">لا توجد نتائج مطابقة.</li>;
            }
        } else {
            // Show search history
            if (searchHistory.length > 0) {
                return searchHistory.map((term, index) => (
                    <li key={index} onClick={() => handleHistoryClick(term)} className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-300/50 dark:hover:bg-black/20 transition-colors">
                        <div className="flex items-center gap-3">
                            <HistoryIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{term}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveSearchHistoryItem(term); }} 
                            className="text-gray-400 hover:text-red-500"
                            aria-label={`إزالة "${term}" من السجل`}
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </li>
                ));
            } else {
                return <li className="text-center p-4 text-gray-500 dark:text-gray-400">لا يوجد سجل بحث.</li>;
            }
        }
    };

    return (
        <div className="w-full max-w-2xl h-[80vh] flex flex-col mx-auto p-4 sm:p-6 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40">
             <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-teal-400 [text-shadow:0_0_10px_theme(colors.teal.500)]">بحث</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50 transition-colors">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </div>
            <div className="relative flex-shrink-0 mb-4">
                <SearchIcon className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن منتج في سجلك..."
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-black/20 border border-gray-400 dark:border-gray-600 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
            </div>
            <ul className="flex-grow overflow-y-auto pr-2 space-y-1">
                {renderContent()}
            </ul>
        </div>
    );
};

export default Search;
