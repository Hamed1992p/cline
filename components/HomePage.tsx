
import React from 'react';
import { BrainIcon } from './icons/BrainIcon';

// Define props based on the `modes` array in App.tsx
interface Mode {
    id: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    description: string;
}

interface HomePageProps {
    modes: Mode[];
    onModeSelect: (modeId: string) => void;
}

const primaryColorMap: { [key: string]: { color: string; glowRgb: string } } = {
    image:        { color: '#22d3ee', glowRgb: '34, 211, 238' },   // cyan-400
    medication:   { color: '#60a5fa', glowRgb: '96, 165, 250' },   // blue-400
    meal:         { color: '#4ade80', glowRgb: '74, 222, 128' },   // green-400
    'general-chat': { color: '#818cf8', glowRgb: '129, 140, 248' }, // indigo-400
};

const secondaryColorMap: { [key: string]: { color: string; glowRgb: string } } = {
    'skin-tracker': { color: '#f472b6', glowRgb: '244, 114, 182' }, // pink-400
    'weekly-report': { color: '#a78bfa', glowRgb: '167, 139, 250' },// violet-400
    'price-comparator': { color: '#c084fc', glowRgb: '192, 132, 252' }, // purple-400
    'scan-text':  { color: '#34d399', glowRgb: '52, 211, 153' }, // emerald-400
    search:       { color: '#fb923c', glowRgb: '251, 146, 60' },   // orange-400
    barcode:      { color: '#9ca3af', glowRgb: '156, 163, 175' },   // gray-400
    voice:        { color: '#fb7185', glowRgb: '251, 113, 133' },   // rose-400
    live:         { color: '#e11d48', glowRgb: '225, 29, 72' },     // rose-600
}


const HomePage: React.FC<HomePageProps> = ({ modes, onModeSelect }) => {
    
    const primaryModes = modes.filter(m => Object.keys(primaryColorMap).includes(m.id));
    const secondaryModes = modes.filter(m => Object.keys(secondaryColorMap).includes(m.id));
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
             <div className="text-center animate-fade-in">
                <BrainIcon className="w-28 h-28 mx-auto text-teal-400 [filter:drop-shadow(0_0_15px_theme(colors.teal.400))]" />
                <h1 className="text-5xl md:text-6xl font-bold text-white mt-4 animate-[text-glow_3s_ease-in-out_infinite]">
                    Hamed AI
                </h1>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                    عدسة الصحة والجمال. ابدأ باختيار أداة أدناه.
                </p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                 {primaryModes.map((mode, index) => {
                    const colors = primaryColorMap[mode.id];
                    const style = {
                        '--node-color': colors.color,
                        '--node-glow-color-rgb': colors.glowRgb,
                        animationDelay: `${index * 100}ms`
                    } as React.CSSProperties;
                    return (
                        <button 
                            key={mode.id} 
                            className="action-card col-span-1 h-full animate-slide-up-fade active:scale-95" 
                            style={style} 
                            onClick={() => onModeSelect(mode.id)}
                        >
                            <mode.icon className="action-card-icon" />
                            <h3 className="action-card-title">{mode.label}</h3>
                            <p className="action-card-desc">{mode.description}</p>
                        </button>
                    );
                })}
            </div>
             
             <div className="w-full max-w-5xl mt-8 pt-8 border-t border-gray-700/50 animate-slide-up-fade" style={{animationDelay: '400ms'}}>
                 <h3 className="text-center text-xl font-semibold text-gray-400 mb-6">أدوات إضافية</h3>
                 <div className="flex flex-wrap justify-center gap-4">
                    {secondaryModes.map((mode, index) => {
                        const colors = secondaryColorMap[mode.id];
                         const style = {
                            '--node-color': colors.color,
                            '--node-glow-color-rgb': colors.glowRgb,
                            animationDelay: `${500 + index * 50}ms`
                        } as React.CSSProperties;
                        return (
                            <button 
                                key={mode.id} 
                                className="relative flex flex-col items-center gap-2 group p-3 rounded-lg w-28 h-28 justify-center transition-all duration-300 hover:bg-white/5 hover:scale-105 hover:-translate-y-1 active:scale-95 animate-slide-up-fade" 
                                style={style} 
                                onClick={() => onModeSelect(mode.id)}
                            >
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 border border-gray-700 group-hover:border-[var(--node-color)] group-hover:shadow-[0_0_15px_rgba(var(--node-glow-color-rgb),0.6)] transition-all duration-300">
                                     <mode.icon className="w-6 h-6 text-gray-400 group-hover:text-[var(--node-color)] group-hover:scale-110 transition-all duration-300" />
                                </div>
                                <span className="text-sm text-center text-gray-300 group-hover:text-white transition-colors">{mode.label}</span>
                            </button>
                        );
                    })}
                 </div>
             </div>
        </div>
    );
};

export default HomePage;
