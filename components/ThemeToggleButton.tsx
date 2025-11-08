
import React from 'react';
import { SunIcon, MoonIcon } from './icons/ThemeIcons';

interface ThemeToggleButtonProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="w-16 h-8 rounded-full bg-slate-300 dark:bg-gray-700 flex items-center p-1 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500"
      aria-label="Toggle theme"
    >
      <div
        className={`w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-500 ease-in-out ${
          theme === 'light' ? 'translate-x-0' : 'translate-x-8'
        }`}
      >
        <div className="relative w-full h-full">
            <SunIcon className={`absolute inset-0 m-auto w-4 h-4 text-yellow-500 transition-opacity duration-500 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
            <MoonIcon className={`absolute inset-0 m-auto w-4 h-4 text-slate-300 transition-opacity duration-500 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggleButton;
