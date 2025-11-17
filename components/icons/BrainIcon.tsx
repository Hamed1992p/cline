
import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    {...props}
  >
    <defs>
      <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#66ff66" />
        <stop offset="50%" stopColor="#4dff4d" />
        <stop offset="100%" stopColor="#33cc33" />
      </linearGradient>
      <radialGradient id="brain-glow-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#adff2f" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#39ff14" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#00ff00" stopOpacity="0.2" />
      </radialGradient>
      <filter id="brain-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <style>
      {`
        .brain-path {
          animation: brain-pulse 5s ease-in-out infinite;
          transform-origin: center;
        }
        .brain-glow-circle {
           animation: glow-pulse 5s ease-in-out infinite;
           transform-origin: center;
        }
        @keyframes brain-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}
    </style>
    <circle cx="32" cy="32" r="28" fill="url(#brain-glow-gradient)" className="brain-glow-circle" />
    <g filter="url(#brain-glow-filter)" className="brain-path">
      <path
        d="M36.6,14.2c-1.3-1-3.2-1.3-4.8-1.4c-2.3-0.2-4.2,0.8-5.3,2.6c-0.8,1.4-1,3.2-0.2,4.6c0.5,1,1.4,1.8,2.5,2.3 c-1.2,0.1-2.4,0.3-3.6,0.8c-2.8,1.1-4.7,3.6-5,6.5c-0.3,3.4,1.4,6.4,4.2,7.9c1.9,1,4.1,1.5,6.4,1.4c0.8,1.4,1,3.1,0.2,4.6 c-0.8,1.7-2.6,2.8-4.6,3c-2.1,0.2-4-0.6-5.4-2.1"
        fill="none"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.4,14.2c1.3-1,3.2-1.3,4.8-1.4c2.3-0.2,4.2,0.8,5.3,2.6c0.8,1.4,1,3.2,0.2,4.6c-0.5,1-1.4,1.8-2.5,2.3 c1.2,0.1,2.4,0.3,3.6,0.8c2.8,1.1,4.7,3.6,5,6.5c0.3,3.4-1.4,6.4-4.2,7.9c-1.9,1-4.1,1.5-6.4,1.4c-0.8,1.4-1,3.1-0.2,4.6 c0.8,1.7,2.6,2.8,4.6,3c2.1,0.2,4-0.6,5.4-2.1"
        fill="none"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32,32.3c-2.6,0-4.8-0.9-6.3-2.5c-1.5-1.6-2-3.8-1.5-5.8"
        fill="none"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32,32.3c2.6,0,4.8-0.9,6.3-2.5c1.5-1.6,2-3.8,1.5-5.8"
        fill="none"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32.5,49.8c0,0,3.3-1.4,3.3-4.1c0-2.8-2.2-5-4.8-5c-2.6,0-4.8,2.2-4.8,5c0,2.7,3.3,4.1,3.3,4.1"
        fill="none"
        stroke="url(#brain-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
