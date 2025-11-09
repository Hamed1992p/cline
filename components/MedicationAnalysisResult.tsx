import React from 'react';
import { MedicationAnalysisResponse } from '../types';
import { ExclamationTriangleIcon } from './icons/ResultIcons';

interface MedicationAnalysisResultProps {
  data: MedicationAnalysisResponse;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-4 border border-slate-300 dark:border-blue-500/20">
        <h3 className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="text-gray-700 dark:text-gray-300 space-y-1">
            {children}
        </div>
    </div>
);

const MedicationAnalysisResult: React.FC<MedicationAnalysisResultProps> = ({ data }) => {
  const mainGlowStyle = `shadow-2xl shadow-slate-400/30 dark:shadow-black/50 dark:[box-shadow:0_0_50px_-12px_theme(colors.blue.500)]`;

  return (
    <div className={`w-full max-w-4xl p-4 sm:p-6 bg-slate-200/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-300/50 dark:border-gray-700/50 ${mainGlowStyle}`}>
        {/* Header */}
        <div className="text-center mb-4">
            <h2 className={`text-4xl font-bold text-blue-500 dark:text-blue-400 [text-shadow:0_0_15px_theme(colors.blue.500)]`}>{data.drugName}</h2>
            {data.activeIngredients && data.activeIngredients.length > 0 && (
                 <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{data.activeIngredients.join(', ')}</p>
            )}
        </div>

        {/* CRITICAL DISCLAIMER */}
        <div className="p-4 my-6 bg-yellow-400/20 dark:bg-yellow-800/30 border-2 border-yellow-500/50 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 text-lg">تحذير هام</h3>
                <p className="text-yellow-900 dark:text-yellow-300/90 text-sm">
                    هذه المعلومات هي تلخيص للنشرة الداخلية وهي لأغراض إرشادية فقط. **إنها ليست بديلاً عن استشارة الطبيب أو الصيدلي.** لا تقم بتغيير جرعتك أو إيقاف دوائك دون استشارة مختص.
                </p>
            </div>
        </div>
        
        {/* Summary */}
        <div className="mb-6 p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">ملخص سريع</h3>
             <p className="text-gray-700 dark:text-gray-300">{data.summary}</p>
        </div>


        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="دواعي الاستعمال" icon={<span className="text-2xl">📋</span>}>
                <ul className="list-disc list-inside">
                    {data.indications.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </InfoCard>

             <InfoCard title="الجرعة وطريقة الاستعمال" icon={<span className="text-2xl">💊</span>}>
                <p>{data.dosage}</p>
            </InfoCard>

            <InfoCard title="الأعراض الجانبية الشائعة" icon={<span className="text-2xl">⚠️</span>}>
                 <ul className="list-disc list-inside">
                    {data.sideEffects.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </InfoCard>

             <InfoCard title="تحذيرات واحتياطات" icon={<span className="text-2xl">🛑</span>}>
                 <ul className="list-disc list-inside">
                    {data.warnings.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </InfoCard>
        </div>
    </div>
  );
};

export default MedicationAnalysisResult;
