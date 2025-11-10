import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

// Define props based on the `modes` array in App.tsx
interface Mode {
    id: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
}

interface HomePageProps {
    modes: Mode[];
    onModeSelect: (modeId: string) => void;
}

const colorMap: { [key: string]: { color: string; glowRgb: string } } = {
    image:        { color: '#22d3ee', glowRgb: '34, 211, 238' },   // cyan-400
    medication:   { color: '#60a5fa', glowRgb: '96, 165, 250' },   // blue-400
    meal:         { color: '#f87171', glowRgb: '248, 113, 113' },  // red-400
    'general-chat': { color: '#818cf8', glowRgb: '129, 140, 248' }, // indigo-400
    future:       { color: '#c084fc', glowRgb: '192, 132, 252' },   // purple-400
    'scan-text':  { color: '#4ade80', glowRgb: '74, 222, 128' },   // green-400
    text:         { color: '#fb923c', glowRgb: '251, 146, 60' },   // orange-400
    barcode:      { color: '#9ca3af', glowRgb: '156, 163, 175' },   // gray-400
    voice:        { color: '#fb7185', glowRgb: '251, 113, 133' },   // rose-400
    live:         { color: '#e11d48', glowRgb: '225, 29, 72' },     // rose-600
};


const HomePage: React.FC<HomePageProps> = ({ modes, onModeSelect }) => {
    
    const radius = 220; // Radius of the orbit

    // Reorder modes to place 'future' at a specific visual position if desired
    const sortedModes = [...modes];
    const futureIndex = sortedModes.findIndex(m => m.id === 'future');
    if (futureIndex > -1) {
        const futureMode = sortedModes.splice(futureIndex, 1)[0];
        sortedModes.splice(4, 0, futureMode); // Insert at 5th position
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-4">
            <div className="constellation-container">
                <div className="central-star">
                    <div className="central-star-core">
                        <LogoIcon className="w-20 h-20 text-teal-400" />
                         <h1 className="text-2xl font-bold text-white mt-1">hamed Ai</h1>
                    </div>
                </div>

                {sortedModes.map((mode, index) => {
                    const angle = (index / sortedModes.length) * 2 * Math.PI;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    const lineAngle = (Math.atan2(y, x) * 180 / Math.PI) + 90;
                    
                    const colors = colorMap[mode.id] || { color: '#94a3b8', glowRgb: '156, 163, 175' };

                    const style = {
                        '--node-transform': `translate(${x}px, ${y}px)`,
                        '--line-length': `${radius}px`,
                        '--line-rotation': `${lineAngle}deg`,
                        '--node-color': colors.color,
                        '--node-glow-color-rgb': colors.glowRgb,
                    } as React.CSSProperties;

                    const isFutureNode = mode.id === 'future';

                    return (
                        <button
                            key={mode.id}
                            className="orbiting-node"
                            style={style}
                            onClick={() => onModeSelect(mode.id)}
                            aria-label={mode.label}
                        >
                            <mode.icon className="node-icon" />
                            <div className="node-label">{mode.label}</div>
                            {isFutureNode && (
                                <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            <p className="mt-12 text-lg text-gray-400 dark:text-gray-500 animate-[subtle-pulse_3s_ease-in-out_infinite]">
                أهلاً بك في المستقبل. اختر نجمًا للبدء.
            </p>
        </div>
    );
};

export default HomePage;