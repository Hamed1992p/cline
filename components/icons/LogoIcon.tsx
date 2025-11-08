
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4fd1c5" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
      </radialGradient>
      <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#d8b4fe" />
      </linearGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feComponentTransfer in="blur" result="boostedBlur">
          <feFuncA type="linear" slope="2" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="boostedBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    <style>
      {`
        .particle {
          animation: orbit 8s linear infinite;
          transform-origin: 50px 50px;
          transition: animation-duration 0.5s;
        }
        .particle2 { animation-delay: -2s; animation-duration: 10s; }
        .particle3 { animation-delay: -4s; animation-duration: 7s; }
        .particle4 { animation-delay: -6s; animation-duration: 9s; }
        .dna-helix {
          animation: dna-glow 3s ease-in-out infinite;
        }
        .back-glow {
          animation: pulse 5s ease-in-out infinite;
          transform-origin: 50% 50%;
          transition: animation-duration 0.5s;
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes dna-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .group:hover .back-glow { animation-duration: 2s; }
        .group:hover .particle { animation-duration: 4s; }
        .group:hover .particle2 { animation-duration: 5s; }
        .group:hover .particle3 { animation-duration: 3.5s; }
        .group:hover .particle4 { animation-duration: 4.5s; }
      `}
    </style>

    <circle cx="50" cy="50" r="48" fill="url(#lensGlow)" opacity="0.6" filter="url(#softGlow)" className="back-glow" />

    <circle cx="50" cy="50" r="40" fill="rgba(15, 23, 42, 0.5)" stroke="#8B5CF6" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="40" fill="url(#lensGlow)" opacity="0.2" />

    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(79, 209, 197, 0.5)" strokeWidth="1.5" />
    
    <g transform="translate(38 42) scale(0.25)" className="dna-helix" filter="url(#softGlow)">
      <path d="M8,1 C12,1 12,7 16,7 C20,7 20,1 24,1" stroke="url(#dnaGradient)" strokeWidth="3" fill="none" />
      <path d="M8,49 C12,49 12,43 16,43 C20,43 20,49 24,49" stroke="url(#dnaGradient)" strokeWidth="3" fill="none" />
      <line x1="10" y1="4" x2="22" y2="46" stroke="url(#dnaGradient)" strokeWidth="2.5" />
      <line x1="22" y1="4" x2="10" y2="46" stroke="url(#dnaGradient)" strokeWidth="2.5" />
    </g>

    <text
        x="50"
        y="58"
        fontFamily="sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
        filter="url(#strongGlow)"
    >
        H
    </text>

    <circle cx="50" cy="5" r="1.5" fill="#4fd1c5" className="particle" />
    <circle cx="50" cy="5" r="1" fill="#8B5CF6" className="particle particle2" />
    <circle cx="50" cy="5" r="1.2" fill="#3B82F6" className="particle particle3" />
    <circle cx="50" cy="5" r="1" fill="#FFFFFF" className="particle particle4" />
  </svg>
);
