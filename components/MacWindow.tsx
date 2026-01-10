import React from 'react';

interface MacWindowProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title: string;
  className?: string;
}

export const MacWindow: React.FC<MacWindowProps> = ({ children, sidebar, title, className = '' }) => {
  return (
    <div className={`mac-shadow flex h-full w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-300 ${className}`}>
      
      {/* Sidebar Area */}
      {sidebar && (
        <div className="sidebar-blur w-56 flex-shrink-0 border-r border-black/5 bg-[#F6F6F6]/90 p-3 select-none">
          <div className="flex h-10 items-center gap-2 mb-4 px-2">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57] border border-black/5"></div>
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E] border border-black/5"></div>
              <div className="h-3 w-3 rounded-full bg-[#28C840] border border-black/5"></div>
            </div>
          </div>
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        
        {/* Toolbar / Header */}
        <div className="flex h-14 items-center justify-between border-b border-black/5 bg-white/50 px-6 backdrop-blur-xl">
          {!sidebar && (
            <div className="flex gap-2 items-center">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57] border border-black/5"></div>
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E] border border-black/5"></div>
              <div className="h-3 w-3 rounded-full bg-[#28C840] border border-black/5"></div>
            </div>
          )}
          
          <div className={`flex-1 flex items-center ${sidebar ? 'justify-start' : 'justify-center'}`}>
            <h1 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Optional Toolbar items like Search could go here */}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-auto bg-white/50 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};