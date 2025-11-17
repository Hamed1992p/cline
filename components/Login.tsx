import React from 'react';
import { BrainIcon } from './icons/BrainIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    return (
        <div className="w-full max-w-md mx-auto p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl dark:shadow-teal-900/40 flex flex-col items-center gap-6 text-center animate-fade-in">
            <BrainIcon className="w-24 h-24 mx-auto text-teal-400 [filter:drop-shadow(0_0_15px_theme(colors.teal.400))]" />
            <h1 className="text-4xl font-bold text-white mt-2 animate-[text-glow_3s_ease-in-out_infinite]">
                مرحباً بك في Hamed AI
            </h1>
            <p className="text-gray-400">
                سجّل الدخول باستخدام حساب Google الخاص بك لحفظ سجل التحليلات وتفضيلاتك.
            </p>
            <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
                <GoogleIcon className="w-6 h-6" />
                تسجيل الدخول باستخدام Google
            </button>
        </div>
    );
};

export default Login;
