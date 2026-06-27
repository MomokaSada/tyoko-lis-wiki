import React from 'react';

export const TyokoreIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`relative shrink-0 overflow-hidden rounded-full bg-white border-2 border-[#d4a373] shadow-sm ${className}`}>
    <div className="absolute inset-0 scale-110">
      <img
        src="/images/character/tyokore.svg"
        alt="Tyokore Icon"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);


