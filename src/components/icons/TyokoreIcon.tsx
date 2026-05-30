import React from 'react';
import Image from 'next/image';

export const TyokoreIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`relative shrink-0 overflow-hidden rounded-full bg-white border-2 border-[#d4a373] shadow-sm ${className}`}>
    <div className="absolute inset-0 scale-110">
      <Image
        src="/images/character/tyokore.png"
        alt="Tyokore Icon"
        fill
        className="object-cover"
        priority
      />
    </div>
  </div>
);


