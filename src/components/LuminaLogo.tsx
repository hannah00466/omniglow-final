import React from 'react';

interface LuminaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export const LuminaLogo: React.FC<LuminaLogoProps> = ({
  size = 'md',
  showWordmark = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', svg: 'w-4 h-4', text: 'text-sm', sub: 'text-[9px]' },
    sm: { box: 'w-8 h-8', svg: 'w-5 h-5', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', svg: 'w-7 h-7', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', svg: 'w-10 h-10', text: 'text-2xl', sub: 'text-xs' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Luxury Monogram Badge */}
      <div
        className={`relative ${current.box} rounded-xl bg-black border border-stone-800 flex items-center justify-center shadow-md transition-all duration-300 hover:border-amber-500/50 shrink-0 overflow-hidden group`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.svg} transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Subtle radiant background */}
          <rect width="48" height="48" fill="#0c0a09" />

          {/* O & G Minimalist Geometry */}
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="#fbbf24"
            strokeWidth="2.8"
            strokeDasharray="4 2"
          />
          <path
            d="M24 16C19.58 16 16 19.58 16 24C16 28.42 19.58 32 24 32C28.42 32 32 28.42 32 24H24"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-bold tracking-[0.18em] text-stone-100 uppercase ${current.text}`}>
              Omni
            </span>
            <span className={`font-serif font-light tracking-[0.18em] text-amber-400 uppercase ${current.text}`}>
              Glow
            </span>
          </div>
          <span className={`font-sans tracking-[0.22em] text-stone-400 uppercase font-medium ${current.sub}`}>
            Sanctuary
          </span>
        </div>
      )}
    </div>
  );
};
