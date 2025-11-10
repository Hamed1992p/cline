
import React from 'react';
import { MealAnalysisResponse } from '../types';
import { ExclamationTriangleIcon } from './icons/ResultIcons';

interface MealAnalysisResultProps {
  data: MealAnalysisResponse;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; color: string }> = ({ title, children, icon, color }) => (
    <div className={`bg-slate-100 dark:bg-black/20 rounded-lg p-4 border border-slate-300 dark:border-${color}-500/20`}>
        <h3 className={`text-lg font-bold text-${color}-500 dark:text-${color}-400 mb-2 flex items-center gap-2`}>
            {icon}
            {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-300 space-y-1">
            {children}
        </div>
    </div>
);


const MealAnalysisResult: React.FC<MealAnalysisResultProps> = ({ data }) => {
  const mainGlowStyle = `shadow-2xl shadow-slate-400/30 dark:shadow-black/50 dark:[box-shadow:0_0_50px_-12px_theme(colors.green.500)]`;

  return (
    <div className={`w-full max-w-4xl p-4 sm:p-6 bg-slate-200/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-300/50 dark:border-gray-700/50 ${mainGlowStyle}`}>
        {/* Header */}
        <div className="text-center mb-4">
            <h2 className={`text-4xl font-bold text-green-500 dark:text-green-400 [text-shadow:0_0_15px_theme(colors.green.500)]`}>{data.mealName}</h2>
        </div>
        
        {/* DISCLAIMER */}
        <div className="p-4 my-6 bg-yellow-400/20 dark:bg-yellow-800/30 border-2 border-yellow-500/50 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 text-lg">ملاحظة هامة</h3>
                <p className="text-yellow-900 dark:text-yellow-300/90 text-sm">
                    هذه المعلومات هي **تقديرات** تم إنشاؤها بواسطة الذكاء الاصطناعي وهي لأغراض إرشادية فقط. **إنها ليست بديلاً عن استشارة أخصائي تغذية.** قد تختلف القيم الغذائية الفعلية.
                </p>
            </div>
        </div>
        
        {/* Calories and Macros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
                <span className="text-sm text-gray-500 dark:text-gray-400">السعرات الحرارية التقديرية</span>
                <span className="text-5xl font-bold text-green-500 dark:text-green-400">{data.estimatedCalories.value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{data.estimatedCalories.unit}</span>
            </div>
             <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg space-y-2">
                 <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">بروتين</span>
                    <span className="font-mono text-lg text-green-600 dark:text-green-400">{data.macronutrients.protein}</span>
                 </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">كربوهيدرات</span>
                    <span className="font-mono text-lg text-orange-600 dark:text-orange-400">{data.macronutrients.carbohydrates}</span>
                 </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">دهون</span>
                    <span className="font-mono text-lg text-yellow-600 dark:text-yellow-500">{data.macronutrients.fat}</span>
                 </div>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4">
             <InfoCard title="مكونات الوجبة" icon={<span className="text-2xl">🍽️</span>} color="green">
                <div className="flex flex-wrap gap-2">
                    {data.identifiedFoods.map((item, i) => <span key={i} className="bg-green-500/10 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">{item}</span>)}
                </div>
            </InfoCard>
            
             <InfoCard title="ملخص صحي" icon={<span className="text-2xl">❤️‍🩹</span>} color="green">
                <p>{data.healthSummary}</p>
            </InfoCard>

            <InfoCard title="اقتراحات للتحسين" icon={<span className="text-2xl">💡</span>} color="green">
                 <ul className="list-disc list-inside space-y-1">
                    {data.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </InfoCard>
        </div>
    </div>
  );
};

export default MealAnalysisResult;
