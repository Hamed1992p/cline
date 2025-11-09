import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { AnalyzeIcon } from './icons/AnalyzeIcon';


interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onAnalyzeClick: () => void;
  imagePreviewUrl: string | null;
  isLoading: boolean;
  hasImage: boolean;
  promptText: string;
  subPromptText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onAnalyzeClick, imagePreviewUrl, isLoading, hasImage, promptText, subPromptText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-6 transition-all duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
      
      <div 
        onClick={handleBoxClick}
        className="w-full h-64 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer bg-slate-50 dark:bg-black/20 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-slate-200 dark:hover:bg-gray-900/50 transition-all duration-300 bg-cover bg-center relative group"
        style={{ backgroundImage: imagePreviewUrl ? `url(${imagePreviewUrl})` : 'none' }}
      >
        <div className="absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 dark:shadow-[inset_0_0_20px_rgba(45,212,191,0.5),0_0_30px_rgba(45,212,191,0.3)]"></div>
        {!imagePreviewUrl && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <UploadIcon className="w-16 h-16 mx-auto mb-2 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-teal-500" />
            <p className="font-semibold">{promptText}</p>
            <p className="text-sm">{subPromptText}</p>
          </div>
        )}
         {imagePreviewUrl && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <p className="text-white font-semibold text-lg drop-shadow-lg">تغيير الصورة</p>
             </div>
         )}
      </div>

      {hasImage && (
         <button 
            onClick={onAnalyzeClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-xl shadow-[0_0_15px_rgba(45,212,191,0.4),0_0_30px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6),0_0_50px_rgba(45,212,191,0.4)] active:translate-y-px"
          >
            <AnalyzeIcon className="w-6 h-6"/>
            {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل'}
         </button>
      )}
    </div>
  );
};

export default ImageUploader;
