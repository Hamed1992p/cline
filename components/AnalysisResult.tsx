

import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisResponse, ChatMessage, EnvironmentalImpact } from '../types';
import ItemCard from './ItemCard';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, ExclamationTriangleIcon } from './icons/ResultIcons';
import { TagIcon, BoxIcon, CategoryIcon, ShareIcon, LeafIcon, DnaIcon } from './icons/DetailIcons';
import { SuggestionIcon } from './icons/SuggestionIcon';
import ChatFollowUp from './ChatFollowUp';
import { PriceTagIcon } from './icons/ActionIcons';

interface AnalysisResultProps {
  data: AnalysisResponse;
  allergies: string[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onFindPrices: (productName: string) => void;
}

const ScoreDisplay: React.FC<{ score: { النقاط: number; التقييم: string; السبب: string; }, color: string }> = ({ score, color }) => {
    const scoreColor = score.النقاط >= 85 ? 'text-green-400' : score.النقاط >= 60 ? 'text-yellow-400' : 'text-red-400';
    const circumference = 2 * Math.PI * 50; // Circumference of the circle
    const offset = circumference - (score.النقاط / 100) * circumference;

    return (
        <div className={`relative w-full p-4 grid grid-cols-1 md:grid-cols-3 items-center gap-4 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-${color}-500/30 shadow-inner`}>
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                    <circle
                        className="text-slate-300 dark:text-gray-700"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                    />
                    <circle
                        className={scoreColor}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="text-center">
                    <span className={`text-5xl font-bold ${scoreColor}`}>{score.التقييم}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({score.النقاط}/100)</span>
                </div>
            </div>
            <p className="md:col-span-2 text-center md:text-right text-gray-700 dark:text-gray-300">
                <strong className={`font-semibold ${scoreColor}`}>الخلاصة:</strong> {score.السبب}
            </p>
        </div>
    );
};

const EnvironmentalImpactDisplay: React.FC<{ data: EnvironmentalImpact }> = ({ data }) => {
    const scoreColor = data.score >= 75 ? 'text-green-400' : data.score >= 40 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="mt-6">
            <h3 className={`text-xl font-bold text-green-500 dark:text-green-400 mb-2 flex items-center gap-2 justify-center [text-shadow:0_0_8px_var(--glow-color)]`}>
                <LeafIcon className="h-6 w-6" />
                الأثر البيئي
            </h3>
            <div className="p-4 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-300 dark:border-green-500/30 space-y-4">
                <div className="text-center">
                    <span className={`text-4xl font-bold ${scoreColor}`}>{data.score}<span className="text-2xl">%</span></span>
                    <p className={`font-semibold ${scoreColor}`}>{data.rating}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-green-600 dark:text-green-400 mb-1">نقاط إيجابية</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {data.positiveAspects.map((pro, i) => <li key={i}>{pro}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">نقاط سلبية</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {data.negativeAspects.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, allergies, chatMessages, onSendMessage, onFindPrices }) => {
  const [themeColor, setThemeColor] = useState('teal');

  useEffect(() => {
    const category = data.فئة_المنتج?.toLowerCase() || '';
    if (category.includes('تجميل') || category.includes('بشرة') || category.includes('عناية')) {
      setThemeColor('pink');
    } else if (category.includes('طعام') || category.includes('غذائي') || category.includes('مشروب') || category.includes('natural')) {
      setThemeColor('green');
    } else {
      setThemeColor('teal');
    }
  }, [data.فئة_المنتج]);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تحليل منتج: ${data.اسم_المنتج}`,
          text: `هذا ملخص تحليل لمنتج "${data.اسم_المنتج}" من Hamed AI:\n\nالتقييم: ${data.التقييم_العام?.التقييم} (${data.التقييم_العام?.النقاط}/100)\nالملخص: ${data.ملخص_التحليل}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('خطأ في مشاركة المحتوى:', error);
      }
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح.');
    }
  };

  const hasDetails = (data.العلامة_التجارية && data.العلامة_التجارية !== 'غير واضح') || 
                     (data.الحجم_او_الوزن && data.الحجم_او_الوزن !== 'غير واضح') || 
                     (data.فئة_المنتج && data.فئة_المنتج !== 'غير واضح');

  const tabs = useMemo(() => [
    { id: 'positive', title: 'إيجابي', icon: <CheckCircleIcon />, data: data.المكونات_الإيجابية },
    { id: 'negative', title: 'سلبي', icon: <XCircleIcon />, data: data.المكونات_السلبية },
    { id: 'questionable', title: 'مشكوك فيه', icon: <QuestionMarkCircleIcon />, data: data.المكونات_المشكوك_فيها },
    { id: 'marketing', title: 'تسويقي', icon: <ExclamationTriangleIcon />, data: data.الممارسات_التسويقية_الخادعة },
  ].filter(tab => tab.data && tab.data.length > 0), [data]);

  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const colorStyles = {
    teal: { text: 'text-teal-500 dark:text-teal-400', glow: '[--glow-color:theme(colors.teal.500)]' },
    green: { text: 'text-green-500 dark:text-green-400', glow: '[--glow-color:theme(colors.green.500)]' },
    pink: { text: 'text-pink-500 dark:text-pink-400', glow: '[--glow-color:theme(colors.pink.500)]' },
  };
  const currentColors = colorStyles[themeColor] || colorStyles.teal;
  const mainGlowStyle = `shadow-2xl shadow-slate-400/30 dark:shadow-black/50 dark:[box-shadow:0_0_50px_-12px_var(--glow-color)]`;

  return (
    <div className={`w-full max-w-4xl p-4 sm:p-6 bg-slate-200/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-slate-300/50 dark:border-gray-700/50 ${mainGlowStyle} ${currentColors.glow}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="text-center flex-grow">
          <h2 className={`text-4xl font-bold ${currentColors.text} [text-shadow:0_0_15px_var(--glow-color)]`}>{data.اسم_المنتج}</h2>
        </div>
        <button onClick={handleShare} className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors duration-300" aria-label="مشاركة التحليل">
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-6 -mt-4">
        {hasDetails && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-gray-700 dark:text-gray-300">
            {data.العلامة_التجارية && data.العلامة_التجارية !== 'غير واضح' && (
              <div className="flex items-center gap-2 bg-slate-300/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-slate-400/50 dark:border-gray-600/50">
                <TagIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{data.العلامة_التجارية}</span>
              </div>
            )}
            {data.الحجم_او_الوزن && data.الحجم_او_الوزن !== 'غير واضح' && (
              <div className="flex items-center gap-2 bg-slate-300/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-slate-400/50 dark:border-gray-600/50">
                <BoxIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{data.الحجم_او_الوزن}</span>
              </div>
            )}
            {data.فئة_المنتج && data.فئة_المنتج !== 'غير واضح' && (
               <div className="flex items-center gap-2 bg-slate-300/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-slate-400/50 dark:border-gray-600/50">
                <CategoryIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{data.فئة_المنتج}</span>
              </div>
            )}
          </div>
        )}
        <p className="mt-4 text-gray-700 dark:text-gray-300">{data.ملخص_التحليل}</p>
      </div>

      <div className="my-4">
        <button onClick={() => onFindPrices(data.اسم_المنتج)} className="w-full flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold py-2 px-4 rounded-lg border border-purple-500/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
            <PriceTagIcon className="w-5 h-5" />
            البحث عن أفضل سعر (محاكاة)
        </button>
      </div>

      {data.التقييم_العام && (
        <div className="my-6">
            <h3 className={`text-xl font-bold ${currentColors.text} mb-2 text-center [text-shadow:0_0_8px_var(--glow-color)]`}>التقييم العام</h3>
            <ScoreDisplay score={data.التقييم_العام} color={themeColor} />
        </div>
      )}
      
      {tabs.length > 0 && activeTab && (
        <div className="mt-8">
           <h3 className={`text-2xl font-bold ${currentColors.text} mb-4 flex items-center gap-3 justify-center [text-shadow:0_0_12px_var(--glow-color)]`}>
            <DnaIcon className="w-8 h-8" />
            تحليل المكونات
          </h3>
          <div className="flex sm:space-x-2 justify-center overflow-x-auto border-b border-slate-300 dark:border-gray-700">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabColorClasses = {
                positive: { text: 'text-green-600 dark:text-green-400', glow: '[--tab-glow-color:theme(colors.green.500)]', border: 'border-green-500' },
                negative: { text: 'text-red-600 dark:text-red-400', glow: '[--tab-glow-color:theme(colors.red.500)]', border: 'border-red-500' },
                questionable: { text: 'text-yellow-600 dark:text-yellow-400', glow: '[--tab-glow-color:theme(colors.yellow.500)]', border: 'border-yellow-500' },
                marketing: { text: 'text-orange-600 dark:text-orange-400', glow: '[--tab-glow-color:theme(colors.orange.500)]', border: 'border-orange-500' },
              };
              const currentTabColors = tabColorClasses[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap 
                    group inline-flex items-center gap-2 py-3 px-4 font-semibold text-sm 
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 focus-visible:ring-teal-500
                    transition-all duration-200 ease-in-out border-b-2
                    ${isActive
                      ? `${currentTabColors.text} ${currentTabColors.glow} ${currentTabColors.border} [text-shadow:0_0_8px_var(--tab-glow-color)]`
                      : `text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white border-transparent`
                    }
                  `}
                >
                  {React.cloneElement(tab.icon, { className: `h-5 w-5 transition-transform duration-200 ${isActive ? 'dark:[filter:drop-shadow(0_0_3px_var(--tab-glow-color))]' : 'group-hover:scale-110'}` })}
                  <span>{tab.title}</span>
                  <span className={`hidden sm:inline-block ml-1 py-0.5 px-2.5 rounded-full text-xs font-bold transition-colors duration-200 ${
                      isActive ? 'bg-black/20 text-gray-300' : 'bg-slate-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.data.length}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="rounded-b-lg animate-fade-in">
             {activeTabData && (
                <div className="py-4 space-y-2">
                    {activeTabData.data.map((item, index) => (
                        <ItemCard key={index} item={item} themeColor={themeColor} allergies={allergies} />
                    ))}
                </div>
             )}
          </div>
        </div>
      )}

      {data.environmentalImpact && <EnvironmentalImpactDisplay data={data.environmentalImpact} />}
      
      {data.اقتراحات_بديلة && data.اقتراحات_بديلة.length > 0 && (
          <div className="mt-6">
              <h3 className={`text-xl font-bold ${currentColors.text} mb-2 flex items-center gap-2 justify-center [text-shadow:0_0_8px_var(--glow-color)]`}>
                <SuggestionIcon className="h-6 w-6" />
                اقتراحات ذكية
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg border border-slate-300 dark:border-gray-700 space-y-3">
                {data.اقتراحات_بديلة.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-slate-200/50 dark:bg-black/20 rounded-md">
                        <p className="font-bold text-gray-800 dark:text-gray-100">{suggestion.اسم_المنتج_البديل}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.السبب}</p>
                    </div>
                ))}
              </div>
          </div>
      )}
        
      {data.ملاحظات_إضافية && (
          <div className="mt-6">
              <h3 className={`text-xl font-bold ${currentColors.text} mb-2 [text-shadow:0_0_8px_var(--glow-color)]`}>ملاحظات إضافية</h3>
              <div className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300 border border-slate-300 dark:border-gray-700">
                <p>{data.ملاحظات_إضافية}</p>
              </div>
          </div>
      )}
      
      <ChatFollowUp messages={chatMessages} onSendMessage={onSendMessage} />

    </div>
  );
};

export default AnalysisResult;