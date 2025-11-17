import React, { useState, useEffect, useCallback } from 'react';
import { PriceComparisonResult, User } from '../types';
import { findProductPrices } from '../services/geminiService';
import { PriceTagIcon } from './icons/ActionIcons';
import { ExclamationTriangleIcon } from './icons/ResultIcons';

interface PriceComparatorProps {
    productName: string;
    onClose: () => void;
}

const PriceComparator: React.FC<PriceComparatorProps> = ({ productName, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PriceComparisonResult | null>(null);
    const [searchQuery, setSearchQuery] = useState(productName);

    const fetchPrices = useCallback(async (query: string) => {
        if (!query) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            const priceResult = await findProductPrices(query, location);
            setResult(priceResult);
        } catch (err: any) {
            console.error(err);
            if (err.code === err.PERMISSION_DENIED) {
                setError("تم رفض الوصول إلى الموقع. لا يمكننا العثور على العروض المحلية.");
            } else {
                setError("حدث خطأ أثناء جلب الأسعار. يرجى المحاولة مرة أخرى.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices(searchQuery);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPrices(searchQuery);
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-purple-500/20 shadow-xl flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-400 [text-shadow:0_0_10px_theme(colors.purple.500)] flex items-center gap-2">
                <PriceTagIcon className="w-7 h-7" />
                مقارنة الأسعار (محاكاة)
            </h2>

            <form onSubmit={handleSearch} className="w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="أدخل اسم المنتج..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
            </form>

            <div className="p-3 my-2 bg-yellow-400/20 dark:bg-yellow-800/30 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <p className="text-yellow-900 dark:text-yellow-300/90 text-xs">
                    <strong>إخلاء مسؤولية:</strong> هذه الميزة هي **محاكاة** تستخدم الذكاء الاصطناعي لتقدير الأسعار بناءً على معلومات الويب العامة. الأسعار والعروض ليست حقيقية أو مباشرة ويجب التحقق منها من المتاجر.
                </p>
            </div>
            
            <div className="w-full">
                {isLoading && <p className="text-center">جاري البحث عن أفضل العروض...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {result && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
                             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{result.productName}</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>
                        </div>
                        <ul className="space-y-3">
                            {result.prices.map((item, i) => (
                                <li key={i} className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-md flex justify-between items-center border-l-4 border-purple-500">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.retailer} {item.isLocal && <span className="text-xs text-green-500">(متجر محلي)</span>}</p>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{item.url}</a>
                                    </div>
                                    <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{item.price}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button onClick={onClose} className="mt-2 bg-gray-500 text-white font-bold py-2 px-6 rounded-full">
                إغلاق
            </button>
        </div>
    );
};

export default PriceComparator;