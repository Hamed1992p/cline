
import React, { useState, useMemo } from 'react';
import { Ingredient, MarketingClaim } from '../types';
import { ExclamationTriangleIcon } from './icons/ResultIcons';

// Chevron icon for collapsible
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


interface ItemCardProps {
    item: Ingredient | MarketingClaim;
    themeColor: string;
    allergies: string[];
    index?: number;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, themeColor, allergies, index = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isIngredient = 'الاسم_العربي' in item;

    const isAllergen = useMemo(() => {
        if (!isIngredient || allergies.length === 0) {
            return false;
        }
        const ingredient = item as Ingredient;
        const lowerCaseAllergies = allergies.map(a => a.toLowerCase().trim()).filter(Boolean);
        const arabicName = ingredient.الاسم_العربي.toLowerCase();
        const scientificName = ingredient.الاسم_العلمي_او_الإنجليزي?.toLowerCase() || '';

        return lowerCaseAllergies.some(allergy =>
            arabicName.includes(allergy) || scientificName.includes(allergy)
        );
    }, [item, allergies, isIngredient]);

    const title = isIngredient ? item.الاسم_العربي : item.الادعاء_التسويقي;
    const subTitle = isIngredient ? item.الاسم_العلمي_او_الإنجليزي : null;
    const description = isIngredient 
        ? (item as Ingredient).الوصف_والفوائد || (item as Ingredient).الوصف_والمخاطر || (item as Ingredient).الوصف_والتساؤلات
        : (item as MarketingClaim).التحليل_والتكذيب_العلمي;

    // Define theme-based hover styles
    const themeHoverStyles: Record<string, string> = {
        teal: 'hover:border-teal-400 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:shadow-[0_8px_30px_-12px_rgba(45,212,191,0.6)]',
        green: 'hover:border-green-400 dark:hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/10 hover:shadow-[0_8px_30px_-12px_rgba(74,222,128,0.6)]',
        pink: 'hover:border-pink-400 dark:hover:border-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:shadow-[0_8px_30px_-12px_rgba(244,114,182,0.6)]',
    };

    const textColors: Record<string, string> = {
        teal: 'text-teal-600 dark:text-teal-300',
        green: 'text-green-600 dark:text-green-300',
        pink: 'text-pink-600 dark:text-pink-300',
    };

    const baseClasses = "rounded-lg border transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:scale-[1.02] animate-slide-up-fade shadow-sm hover:shadow-xl";
    
    let containerClasses = "";
    let titleColorClass = "";
    let iconColorClass = "";

    if (isAllergen) {
        containerClasses = `${baseClasses} border-red-500/80 bg-red-500/10 dark:bg-red-900/20 shadow-md shadow-red-900/40 dark:shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:bg-red-500/20 dark:hover:bg-red-900/30 hover:border-red-400 hover:shadow-[0_10px_40px_-12px_rgba(239,68,68,0.5)]`;
        titleColorClass = "text-red-700 dark:text-red-400";
        iconColorClass = "text-red-600 dark:text-red-400";
    } else {
        const hoverClass = themeHoverStyles[themeColor] || themeHoverStyles.teal;
        containerClasses = `${baseClasses} border-slate-300 dark:border-gray-700 bg-slate-100/50 dark:bg-black/20 ${hoverClass}`;
        titleColorClass = textColors[themeColor] || textColors.teal;
    }

    return (
        <div 
            className={containerClasses}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <button
                className="w-full flex items-center justify-between p-4 text-right group"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3 text-left">
                    {isAllergen && <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 ${iconColorClass}`} />}
                    <h4 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:${titleColorClass} transition-colors duration-300`}>{title}</h4>
                </div>
                <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-gray-800 dark:group-hover:text-white`} />
            </button>
            <div
                className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 border-t border-slate-300/50 dark:border-gray-600/50">
                    {subTitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-2 font-mono">{subTitle}</p>}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{description}</p>
                    {item.مصادر_علمية && item.مصادر_علمية.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">مصادر:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {item.مصادر_علمية.map((source, index) => (
                                    <li key={index} className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                        <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors hover:text-blue-700 dark:hover:text-blue-300">{source}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
