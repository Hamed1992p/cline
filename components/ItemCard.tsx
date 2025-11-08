
import React, { useMemo } from 'react';
import { Ingredient, MarketingClaim } from '../types';
import { ExclamationTriangleIcon } from './icons/ResultIcons';

interface ItemCardProps {
    item: Ingredient | MarketingClaim;
    themeColor: string;
    allergies: string[];
}

const ItemCard: React.FC<ItemCardProps> = ({ item, themeColor, allergies }) => {
    const isIngredient = 'الاسم_العربي' in item;

    const isAllergen = useMemo(() => {
        if (!isIngredient || allergies.length === 0) {
            return false;
        }
        const ingredient = item as Ingredient;
        const lowerCaseAllergies = allergies.map(a => a.toLowerCase());
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
        shadow: 'shadow-lg shadow-red-900/50 dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    };
    
    const currentTheme = isAllergen ? allergenClasses : (colorClasses[themeColor] || colorClasses.teal);

    return (
        <div className={`p-4 rounded-md border-l-4 ${currentTheme.border} ${isAllergen ? allergenClasses.shadow : ''} transition-all duration-300 hover:bg-slate-300/20 dark:hover:bg-black/20`}>
            <div className="flex items-center gap-2">
                {isAllergen && <ExclamationTriangleIcon className={`h-5 w-5 ${allergenClasses.text}`} />}
                <h4 className={`text-lg font-semibold text-gray-800 dark:${currentTheme.text}`}>{title}</h4>
            </div>
            {subTitle && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-mono">{subTitle}</p>}
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{description}</p>
            {item.مصادر_علمية && item.مصادر_علمية.length > 0 && (
                <div className="mt-3">
                    <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400">مصادر:</h5>
                    <ul className="list-disc list-inside space-y-1">
                        {item.مصادر_علمية.map((source, index) => (
                            <li key={index} className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">{source}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ItemCard;
