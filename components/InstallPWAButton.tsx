import React from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';
import { InstallIcon } from './icons/InstallIcon';

const InstallPWAButton: React.FC = () => {
  const { promptEvent, handleInstall } = useInstallPrompt();

  if (!promptEvent) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-5 left-5 z-[100] h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-gradient-to-br from-purple-500 to-indigo-600 ring-indigo-400 shadow-[0_0_20px_rgba(167,139,250,0.5)] px-4"
      aria-label="تثبيت التطبيق"
    >
      <InstallIcon className="w-8 h-8" />
      <span className="ml-2 font-semibold hidden sm:inline">تثبيت التطبيق</span>
    </button>
  );
};

export default InstallPWAButton;
