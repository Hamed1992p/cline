
import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <radialGradient id="ai-core-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="70%" stopColor="currentColor" stopOpacity="0.3" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </radialGradient>
       <filter id="ai-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
      </filter>
    </defs>
    <style>
      {`
        .ai-orbit {
          animation: ai-rotate 15s linear infinite;
          transform-origin: 50% 50%;
        }
        .ai-orbit-2 { animation-duration: 20s; animation-direction: reverse; }
        .ai-orbit-3 { animation-duration: 25s; }
        .ai-pulse {
          animation: ai-pulse-anim 4s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        @keyframes ai-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ai-pulse-anim {
          0%, 100% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}
    </style>
    <circle cx="50" cy="50" r="45" fill="url(#ai-core-glow)" opacity="0.5" className="ai-pulse" />
    <g className="ai-pulse">
        <circle cx="50" cy="50" r="18" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="12" fill="currentColor" filter="url(#ai-glow-filter)" />
    </g>
    <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" fill="none">
        <ellipse cx="50" cy="50" rx="30" ry="15" className="ai-orbit" transform="rotate(-30 50 50)" />
        <ellipse cx="50" cy="50" rx="40" ry="12" className="ai-orbit ai-orbit-2" transform="rotate(20 50 50)" />
        <ellipse cx="50" cy="50" rx="25" ry="35" className="ai-orbit ai-orbit-3" transform="rotate(70 50 50)" />
    </g>
  </svg>
);
