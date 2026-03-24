import React from 'react';

// TÜBİTAK Ulusal Gözlemevi (TUG) Neon Logo
export function TugLogo({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tug-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <filter id="tug-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer Hexagon/Dome Frame */}
      <path d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" fill="rgba(10,30,80,0.6)" stroke="url(#tug-glow)" strokeWidth="3" filter="url(#tug-blur)"/>
      
      {/* Telescope Dome Element */}
      <path d="M25 60 C25 40 75 40 75 60" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 43 L65 25" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Center Star */}
      <path d="M50 20 L53 30 L63 33 L53 36 L50 46 L47 36 L37 33 L47 30 Z" fill="#bfdbfe" filter="url(#tug-blur)" />
      
      {/* Base */}
      <rect x="25" y="65" width="50" height="8" rx="2" fill="#3b82f6" fillOpacity="0.8" />
    </svg>
  );
}

// Doğu Anadolu Gözlemevi (DAG) Neon Logo
export function DagLogo({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dag-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <filter id="dag-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Shield/Eye Frame */}
      <path d="M50 5 C80 20 90 50 50 95 C10 50 20 20 50 5 Z" fill="rgba(30,10,70,0.6)" stroke="url(#dag-glow)" strokeWidth="3" filter="url(#dag-blur)"/>
      
      {/* Futurist Teleskop Geometrisi */}
      <circle cx="50" cy="45" r="18" stroke="#c4b5fd" strokeWidth="3" fill="none" />
      <circle cx="50" cy="45" r="8" fill="#a78bfa" filter="url(#dag-blur)" />
      <path d="M50 63 L65 85 L35 85 Z" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 25 L50 15 L60 25" stroke="#ddd6fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
