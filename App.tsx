
import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResponse } from './types';
import { analyzeProductImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import { LogoIcon } from './components/icons/LogoIcon';
import ThemeToggleButton from './components/ThemeToggleButton';
import AllergyManager from './components/AllergyManager';
import { AllergyIcon } from './components/icons/AllergyIcon';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'dark';
  });

  const [allergies, setAllergies] = useState<string[]>([]);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedAllergies = localStorage.getItem('userAllergies');
      if (savedAllergies) {
        setAllergies(JSON.parse(savedAllergies));
      }
    } catch (e) {
      console.error("Failed to parse allergies from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userAllergies', JSON.stringify(allergies));
  }, [allergies]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Update body background for theme consistency
    document.body.className = `transition-colors duration-500 ${theme === 'dark' ? 'bg-[#05070a]' : 'bg-slate-100'}`;
  }, [theme]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setAnalysis(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imageBase64) {
      setError('الرجاء تحديد صورة أولاً.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const base64Data = imageBase64.split(',')[1];
      const result = await analyzeProductImage(base64Data, imageFile.type);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحليل الصورة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imageBase64]);
  
  const resetState = () => {
    setImageFile(null);
    setImageBase64(null);
    setIsLoading(false);
    setAnalysis(null);
    setError(null);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handleAddAllergy = (allergy: string) => {
    if (allergy && !allergies.find(a => a.toLowerCase() === allergy.toLowerCase())) {
        setAllergies([...allergies, allergy]);
    }
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter(allergy => allergy !== allergyToRemove));
  };


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col items-center p-4 selection:bg-teal-500 selection:text-white transition-colors duration-500">
      <header className="w-full max-w-4xl py-4 px-6 my-4 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-slate-300/30 dark:border-teal-500/20 rounded-2xl flex justify-between items-center shadow-lg dark:shadow-[0_0_30px_rgba(45,212,191,0.2)]">
        <div className="flex items-center gap-2">
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            <button
                onClick={() => setIsAllergyModalOpen(true)}
                className="p-2 rounded-full bg-slate-300/50 dark:bg-gray-700/50 text-red-600 dark:text-red-400 hover:bg-slate-400/50 dark:hover:bg-gray-600/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 relative"
                aria-label="إدارة الحساسية"
            >
                <AllergyIcon className="w-6 h-6" />
                {allergies.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {allergies.length}
                    </span>
                )}
            </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 group">
            <LogoIcon className="w-16 h-16 text-teal-600 dark:text-teal-400 [filter:drop-shadow(0_0_8px_theme(colors.teal.500))] transition-all duration-300 group-hover:[filter:drop-shadow(0_0_15px_theme(colors.teal.400))]" />
            <h1 
              className="text-5xl font-bold text-gray-800 dark:text-white transition-all duration-300 animate-[neon-flicker_4s_ease-in-out_infinite] group-hover:animate-none"
              style={{
                textShadow: `
                  0 0 5px rgba(255, 255, 255, 0.8),
                  0 0 10px rgba(45, 212, 191, 0.8),
                  0 0 20px rgba(45, 212, 191, 0.6),
                  0 0 40px rgba(45, 212, 191, 0.4),
                  0 0 80px rgba(45, 212, 191, 0.2)`
              }}
            >
              hamed Ai
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Lens of Health & Beauty</p>
        </div>
        <div className="w-28"></div>
      </header>
      
      <main className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center">
        {!analysis && !isLoading && (
          <ImageUploader 
            onImageSelect={handleImageSelect}
            onAnalyzeClick={handleAnalyzeClick}
            imagePreviewUrl={imageBase64}
            isLoading={isLoading}
            hasImage={!!imageFile}
          />
        )}

        {isLoading && <Loader />}

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 dark:bg-red-900/50 border-2 border-red-500/40 dark:border-red-700/80 rounded-lg text-center text-red-700 dark:text-red-300 shadow-lg dark:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <p className="font-semibold text-lg">خطأ</p>
            <p>{error}</p>
          </div>
        )}

        {analysis && (
          <div className="w-full transition-all duration-500 ease-in-out animate-fade-in">
            <AnalysisResult data={analysis} allergies={allergies} />
            <div className="text-center mt-8">
              <button 
                onClick={resetState}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px"
                >
                تحليل منتج آخر
              </button>
            </div>
          </div>
        )}
      </main>

       <footer className="w-full max-w-4xl text-center py-4 mt-auto">
          <p className="text-gray-500 dark:text-gray-600 text-sm">
            تم التطوير بواسطة hamed Ai &copy; 2024
          </p>
        </footer>
        
        <AllergyManager
            isOpen={isAllergyModalOpen}
            onClose={() => setIsAllergyModalOpen(false)}
            allergies={allergies}
            onAddAllergy={handleAddAllergy}
            onRemoveAllergy={handleRemoveAllergy}
        />
    </div>
  );
};

export default App;