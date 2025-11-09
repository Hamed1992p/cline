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

const HomePage: React.FC<HomePageProps> = ({ modes, onModeSelect }) => {
    
    const radius = 220; // Radius of the orbit

    return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-4">
            <div className="constellation-container">
                <div className="central-star">
                    <div className="central-star-core">
                        <LogoIcon className="w-20 h-20 text-teal-400" />
                         <h1 className="text-2xl font-bold text-white mt-1">hamed Ai</h1>
                    </div>
                </div>

                {modes.map((mode, index) => {
                    const angle = (index / modes.length) * 2 * Math.PI;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    const lineAngle = (Math.atan2(y, x) * 180 / Math.PI) + 90;

                    const style = {
                        '--node-transform': `translate(${x}px, ${y}px)`,
                        '--line-length': `${radius}px`,
                        '--line-rotation': `${lineAngle}deg`,
                    } as React.CSSProperties;

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