import React from 'react';

export const KostAcarya1Illustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="60%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="wallGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbfbfb" />
          <stop offset="100%" stopColor="#e5e5e5" />
        </linearGradient>
        <linearGradient id="roofGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
      </defs>

      {/* Sky & Sun */}
      <rect width="800" height="500" fill="url(#skyGrad)" />
      <circle cx="680" cy="90" r="50" fill="#fde68a" opacity="0.8" />
      <circle cx="680" cy="90" r="65" fill="#fef08a" opacity="0.3" />

      {/* Tropical foliage background */}
      <path d="M0,280 Q70,220 160,280 Q240,210 350,270 Q450,230 550,280 Q680,210 800,280 L800,500 L0,500 Z" fill="#047857" opacity="0.4" />
      <path d="M0,310 Q80,260 180,310 Q280,250 400,300 Q500,260 620,310 Q720,270 800,320 L800,500 L0,500 Z" fill="#065f46" opacity="0.5" />

      {/* Ground & Paved Yard */}
      <rect x="0" y="380" width="800" height="120" fill="#e7e5e4" />
      <line x1="0" y1="410" x2="800" y2="410" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="16,8" />
      <line x1="0" y1="450" x2="800" y2="450" stroke="#d6d3d1" strokeWidth="2" strokeDasharray="20,10" />

      {/* Kost Acarya 1 Main Two-Story Building */}
      {/* 2nd floor */}
      <rect x="180" y="160" width="440" height="130" fill="url(#wallGrad1)" stroke="#d4d4d4" strokeWidth="2" rx="4" />
      {/* Modern Balinese styled Roof */}
      <polygon points="150,160 400,100 650,160" fill="url(#roofGrad1)" />
      {/* Decorative Ridge / Nok Bali */}
      <polygon points="370,100 400,80 430,100" fill="#f59e0b" />

      {/* 2nd Floor Balcony & Railing */}
      <rect x="190" y="250" width="420" height="40" fill="#f3f4f6" />
      <line x1="190" y1="260" x2="610" y2="260" stroke="#475569" strokeWidth="4" />
      <line x1="190" y1="285" x2="610" y2="285" stroke="#475569" strokeWidth="4" />
      {[220, 260, 300, 340, 380, 420, 460, 500, 540, 580].map((x) => (
        <line key={x} x1={x} y1="250" x2={x} y2="290" stroke="#64748b" strokeWidth="2" />
      ))}

      {/* 2nd Floor Doors & Windows */}
      {/* Room 201 */}
      <rect x="220" y="180" width="45" height="70" fill="url(#woodGrad)" rx="2" />
      <rect x="280" y="190" width="50" height="50" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
      {/* Room 202 */}
      <rect x="360" y="180" width="45" height="70" fill="url(#woodGrad)" rx="2" />
      <rect x="420" y="190" width="50" height="50" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
      {/* Room 203 */}
      <rect x="500" y="180" width="45" height="70" fill="url(#woodGrad)" rx="2" />
      <rect x="560" y="190" width="45" height="50" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />

      {/* 1st floor */}
      <rect x="180" y="290" width="440" height="110" fill="url(#wallGrad1)" stroke="#d4d4d4" strokeWidth="2" rx="4" />
      {/* 1st Floor Terrace Pillars */}
      {[200, 320, 440, 590].map((x) => (
        <rect key={x} x1={x} y="290" width="16" height="110" fill="#78716c" rx="1" />
      ))}

      {/* 1st Floor Doors */}
      <rect x="235" y="315" width="48" height="85" fill="url(#woodGrad)" rx="2" />
      <rect x="350" y="315" width="48" height="85" fill="url(#woodGrad)" rx="2" />
      <rect x="475" y="315" width="48" height="85" fill="url(#woodGrad)" rx="2" />

      {/* Signboard "KOST ACARYA 1" */}
      <rect x="320" y="125" width="160" height="30" fill="#064e3b" rx="6" stroke="#fbbf24" strokeWidth="2" />
      <text x="400" y="145" fill="#fef08a" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1">
        KOST ACARYA 1
      </text>

      {/* Potted Tropical Frangipani & Plants */}
      <ellipse cx="140" cy="420" rx="35" ry="12" fill="#78350f" opacity="0.3" />
      {/* Pot 1 */}
      <polygon points="120,420 160,420 152,380 128,380" fill="#b45309" />
      <circle cx="140" cy="350" r="30" fill="#10b981" />
      <circle cx="130" cy="335" r="18" fill="#34d399" />
      <circle cx="155" cy="345" r="14" fill="#6ee7b7" />
      <circle cx="140" cy="330" r="5" fill="#fef08a" />
      <circle cx="150" cy="355" r="5" fill="#fef08a" />

      {/* Pot 2 on right */}
      <polygon points="640,420 680,420 672,380 648,380" fill="#b45309" />
      <circle cx="660" cy="350" r="28" fill="#059669" />
      <circle cx="670" cy="335" r="16" fill="#10b981" />

      {/* Parked scooter silhouette */}
      <g transform="translate(60, 360)">
        <circle cx="20" cy="40" r="14" fill="#334155" />
        <circle cx="20" cy="40" r="8" fill="#94a3b8" />
        <circle cx="70" cy="40" r="14" fill="#334155" />
        <circle cx="70" cy="40" r="8" fill="#94a3b8" />
        <path d="M20,40 L40,25 L60,25 L70,40" stroke="#047857" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M35,25 L25,10 L35,10" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="42" y="16" width="22" height="7" rx="3" fill="#0f172a" />
      </g>
    </svg>
  );
};
