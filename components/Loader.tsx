import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="flex items-center justify-center space-x-3 h-20">
        <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.4s' }}></div>
        <div className="w-4 h-full bg-teal-400 rounded-full wave-bar [filter:drop-shadow(0_0_8px_theme(colors.teal.400))]" style={{ animationDelay: '0.5s' }}></div>
      </div>
      <p 
        className="text-lg text-teal-300 font-semibold animate-[text-glow_2s_ease-in-out_infinite]"
      >
        ...العقل الاصطناعي يعمل
      </p>
    </div>
  );
};

export default Loader;