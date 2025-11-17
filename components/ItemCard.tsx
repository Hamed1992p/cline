
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
}

const ItemCard: React.FC<ItemCardProps> = ({ item, themeColor, allergies }) => {
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

    const colorClasses = {
        teal: { border: 'border-teal-500/60', text: 'text-teal-300' },
        green: { border: 'border-green-500/60', text: 'text-green-300' },
        pink: { border: 'border-pink-500/60', text: 'text-pink-300' },
    };
    const allergenClasses = {
        border: 'border-red-500/80',
        text: 'text-red-400',
        shadow: 'shadow-md shadow-red-900/40 dark:shadow-[0_0_10px_rgba(239,68,68,0.4)]',
        bg: 'bg-red-500/10 dark:bg-red-900/20'
    };
    
    const currentTheme = isAllergen ? allergenClasses : (colorClasses[themeColor] || colorClasses.teal);

    return (
        <div className={`rounded-lg border ${isAllergen ? `${allergenClasses.border} ${allergenClasses.shadow} ${allergenClasses.bg}` : 'border-slate-300 dark:border-gray-700 bg-slate-100/50 dark:bg-black/20'} transition-all duration-300`}>
            <button
                className="w-full flex items-center justify-between p-4 text-right"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3 text-left">
                    {isAllergen && <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 ${allergenClasses.text}`} />}
                    <h4 className={`text-lg font-semibold text-gray-800 ${isAllergen ? `dark:${allergenClasses.text}` : `dark:${currentTheme.text}`}`}>{title}</h4>
                </div>
                <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 border-t border-slate-300/50 dark:border-gray-600/50">
                    {subTitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-2 font-mono">{subTitle}</p>}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{description}</p>
                    {item.مصادر_علمية && item.مصادر_علمية.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400">مصادر:</h5>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                                {item.مصادر_علمية.map((source, index) => (
                                    <li key={index} className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                        <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">{source}</a>
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
