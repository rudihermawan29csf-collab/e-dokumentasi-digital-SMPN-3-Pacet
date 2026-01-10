import React from 'react';

interface MacWindowProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  title: string;
  className?: string;
  brand?: React.ReactNode;
  status?: React.ReactNode;
}

export const MacWindow: React.FC<MacWindowProps> = ({ children, navigation, title, className = '', brand, status }) => {
  return (
    <div className={`mac-shadow flex flex-col h-full w-full overflow-hidden rounded-xl md:rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-300 ${className}`}>
      
      {/* Title Bar & Navigation Container */}
      <div className="flex-none flex flex-col border-b border-black/5 bg-white/50 backdrop-blur-3xl">
        
        {/* Title Bar - Integrated School Identity */}
        <div className="flex h-10 md:h-12 items-center px-4 gap-3">
          {/* macOS Traffic Lights */}
          <div className="flex gap-1.5 md:gap-2 shrink-0">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] border border-black/5 shadow-inner"></div>
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] border border-black/5 shadow-inner"></div>
            <div className="h-3 w-3 rounded-full bg-[#28C840] border border-black/5 shadow-inner"></div>
          </div>
          
          {/* Brand & Status - Moved here for better visibility */}
          <div className="flex items-center gap-2 md:gap-3 border-l border-black/10 pl-3 overflow-hidden">
            {brand && <div className="shrink-0">{brand}</div>}
            {status && <div className="shrink-0">{status}</div>}
          </div>
          
          {/* Centered Window Title */}
          <div className="flex-1 flex items-center justify-center pointer-events-none">
            <h1 className="text-[10px] md:text-[11px] font-black text-[#1D1D1F]/40 uppercase tracking-[0.2em] truncate px-4 hidden sm:block">
              {title}
            </h1>
          </div>

          {/* Spacer to balance the left side */}
          <div className="hidden md:block w-32"></div>
        </div>

        {/* Top Navigation Bar (Tabs/Buttons) */}
        {navigation && (
          <div className="px-3 md:px-6 pb-3 pt-0">
            <div className="flex items-center justify-between gap-2">
              {navigation}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white no-scrollbar custom-scrollbar overscroll-contain">
        {children}
      </div>
    </div>
  );
};