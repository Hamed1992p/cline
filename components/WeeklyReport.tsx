import React, { useState, useCallback } from 'react';
import { ScanHistoryItem, UserProfile, WeeklyReportData, AnalysisResponse } from '../types';
import { generateWeeklyReport } from '../services/geminiService';
import { WeeklyReportIcon } from './icons/ActionIcons';

interface WeeklyReportProps {
    scanHistory: ScanHistoryItem[];
    profile: UserProfile;
    onClose: () => void;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ scanHistory, profile, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<WeeklyReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const weeklyHistory = scanHistory
                .filter(item => new Date(item.id) >= oneWeekAgo)
                .map(item => item.analysis);
            
            if (weeklyHistory.length === 0) {
                setError("لا يوجد سجل تحليلات في الأسبوع الماضي لإنشاء تقرير.");
                setIsLoading(false);
                return;
            }

            const result = await generateWeeklyReport(weeklyHistory, profile);
            setReport(result);
        } catch (err) {
            console.error(err);
            setError("حدث خطأ أثناء إنشاء التقرير الأسبوعي.");
        } finally {
            setIsLoading(false);
        }
    }, [scanHistory, profile]);

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-indigo-500/20 shadow-xl flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-indigo-400 [text-shadow:0_0_10px_theme(colors.indigo.500)] flex items-center gap-2">
                <WeeklyReportIcon className="w-7 h-7" />
                التقرير الأسبوعي
            </h2>
            
            {!report && !isLoading && (
                 <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">احصل على ملخص مخصص لنشاطك ونصائح بناءً على المنتجات التي قمت بتحليلها خلال الأسبوع الماضي.</p>
                    <button onClick={handleGenerateReport} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg">
                        إنشاء تقريري
                    </button>
                </div>
            )}
            
            {isLoading && <p className="text-center">جاري تحليل نشاطك الأسبوعي...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {report && (
                <div className="w-full space-y-4 animate-fade-in">
                    <div>
                        <h3 className="font-bold text-indigo-500 dark:text-indigo-400">ملخص الأسبوع</h3>
                        <p className="text-sm p-3 bg-slate-100 dark:bg-black/20 rounded-md">{report.summary}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-indigo-500 dark:text-indigo-400">اتجاهات ملحوظة</h3>
                        <ul className="list-disc list-inside text-sm p-3 bg-slate-100 dark:bg-black/20 rounded-md space-y-1">
                           {report.trends.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-bold text-indigo-500 dark:text-indigo-400">منتج الأسبوع</h3>
                        <div className="p-3 bg-slate-100 dark:bg-black/20 rounded-md">
                            <p className="font-semibold">{report.productSpotlight.productName}</p>
                            <p className="text-sm">{report.productSpotlight.reason}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-bold text-indigo-500 dark:text-indigo-400">نصائح مخصصة لك</h3>
                        <ul className="list-disc list-inside text-sm p-3 bg-slate-100 dark:bg-black/20 rounded-md space-y-1">
                           {report.personalizedTips.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}


            <button onClick={onClose} className="mt-4 bg-gray-500 text-white font-bold py-2 px-6 rounded-full">
                إغلاق
            </button>
        </div>
    );
};

export default WeeklyReport;