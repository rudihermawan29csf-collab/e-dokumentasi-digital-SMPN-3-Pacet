import React from 'react';

interface MacWindowProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  title: string;
  className?: string;
}

export const MacWindow: React.FC<MacWindowProps> = ({ children, navigation, title, className = '' }) => {
  return (
    <div className={`mac-shadow flex flex-col h-full w-full overflow-hidden rounded-xl md:rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-300 ${className}`}>
      
      {/* Title Bar & Navigation Container - Fixed top of window */}
      <div className="flex-none flex flex-col border-b border-black/5 bg-white/50 backdrop-blur-3xl">
        
        {/* Title Bar */}
        <div className="flex h-9 md:h-10 items-center px-4">
          <div className="flex gap-1.5 md:gap-2 w-16">
            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#FF5F57] border border-black/5 shadow-inner"></div>
            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#FEBC2E] border border-black/5 shadow-inner"></div>
            <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-[#28C840] border border-black/5 shadow-inner"></div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-[9px] md:text-[11px] font-black text-[#1D1D1F]/40 uppercase tracking-[0.2em] truncate px-2">{title}</h1>
          </div>

          <div className="w-16"></div>
        </div>

        {/* Top Navigation Bar */}
        {navigation && (
          <div className="px-3 md:px-6 pb-2.5 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              {navigation}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content Body - flex-grow to fill available space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white no-scrollbar custom-scrollbar overscroll-contain">
        {children}
      </div>
    </div>
  );
};