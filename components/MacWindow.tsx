
import React from 'react';

interface MacWindowProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  title: string;
  className?: string;
}

export const MacWindow: React.FC<MacWindowProps> = ({ children, navigation, title, className = '' }) => {
  return (
    <div className={`mac-shadow flex flex-col h-full w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-300 ${className}`}>
      
      {/* Title Bar & Navigation Container */}
      <div className="flex flex-col border-b border-black/5 bg-white/50 backdrop-blur-3xl">
        
        {/* Title Bar */}
        <div className="flex h-10 items-center px-4">
          <div className="flex gap-2 w-16">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] border border-black/5"></div>
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] border border-black/5"></div>
            <div className="h-3 w-3 rounded-full bg-[#28C840] border border-black/5"></div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-[11px] font-bold text-[#1D1D1F]/60 uppercase tracking-widest">{title}</h1>
          </div>

          <div className="w-16"></div> {/* Spacer to center title */}
        </div>

        {/* Top Navigation Bar (The old Sidebar) */}
        {navigation && (
          <div className="px-6 pb-3 pt-1">
            <div className="flex items-center justify-between gap-4">
              {navigation}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar no-scrollbar">
        {children}
      </div>
    </div>
  );
};
