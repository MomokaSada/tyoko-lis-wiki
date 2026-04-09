import React from 'react';

export const TyokoreIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#d4a373" strokeWidth="2"/>
    <path d="M20 40 Q50 10 80 40 L85 60 L15 60 Z" fill="#a98467" />
    <circle cx="35" cy="55" r="5" fill="#432818" />
    <circle cx="65" cy="55" r="5" fill="#432818" />
    <path d="M45 75 Q50 78 55 75" stroke="#432818" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
