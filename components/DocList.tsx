
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Download, Image as ImageIcon, FileType, Search, X, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react';
import { DocumentationItem } from '../types.ts';

interface DocListProps {
  items: DocumentationItem[];
  onEdit: (item: DocumentationItem) => void;
  onDelete: (id: string) => void;
  onDownload: (item: DocumentationItem) => void;
}

export const DocList: React.FC<DocListProps> = ({ items, onEdit, onDelete, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchTerm]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, Record<string, DocumentationItem[]>> = {};
    
    filteredItems.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('id-ID', { month: 'long' });
      
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      
      groups[year][month].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  const sortedYears = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-full bg-[#FAFAFA]">
      {/* Search & Stats Bar - Optimized for Mobile */}
      <div className="sticky top-0 z-[40] flex flex-col gap-3 border-b border-black/5 bg-white/90 px-4 md:px-8 py-4 md:py-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-[#1D1D1F] tracking-tight">Koleksi Foto</h2>
          <div className="flex items-center gap-2">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#86868B] bg-black/5 px-2 md:px-3 py-1 rounded-full">
              {filteredItems.length} ITEM
            </span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
          <input 
            type="text" 
            placeholder="Cari kegiatan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-black/5 pl-10 pr-10 py-2.5 text-sm font-bold placeholder:font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all border border-transparent focus:border-[#007AFF]/30"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-black p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Content - Optimized Grid and Spacing */}
      <div className="p-4 md:p-8 space-y-8 md:space-y-12">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5">
              <ImageIcon className="text-[#007AFF]" size={32} />
            </div>
            <h3 className="text-lg font-black text-[#1D1D1F]">Tidak Ada Hasil</h3>
            <p className="mt-2 text-sm font-bold text-[#86868B] max-w-[200px] mx-auto leading-tight">
              {searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Mulai tambahkan dokumentasi.'}
            </p>
          </div>
        ) : (
          sortedYears.map(year => (
            <section key={year} className="relative">
              {/* Year Header - Sticky Adjustment */}
              <div className="sticky top-[108px] md:top-[124px] z-[30] -mx-4 md:-mx-8 mb-4 md:mb-6 px-4 md:px-8 py-2 bg-[#FAFAFA]/95 backdrop-blur-md flex items-center gap-3 border-y border-black/5">
                <span className="text-2xl md:text-3xl font-black text-[#1D1D1F] tracking-tighter italic">{year}</span>
                <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
              </div>

              <div className="space-y-8 md:space-y-10">
                {Object.keys(groupedItems[year]).map(month => (
                  <div key={`${year}-${month}`} className="space-y-4">
                    {/* Month Header */}
                    <div className="flex items-center gap-2 text-[#007AFF] px-1">
                      <CalendarDays size={18} strokeWidth={3} />
                      <h3 className="text-lg font-black tracking-tight">{month}</h3>
                      <div className="h-4 w-[1px] bg-black/10 mx-1"></div>
                      <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">
                        {groupedItems[year][month].length} Sesi
                      </span>
                    </div>

                    {/* Cards Grid - Single column on mobile, Multi on desktop */}
                    <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {groupedItems[year][month].map((item) => {
                        const imageFiles = item.files.filter(f => f.type === 'image');
                        const pdfFiles = item.files.filter(f => f.type === 'pdf');

                        return (
                          <div key={item.id} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99]">
                            
                            {/* Photo Slider Preview - Improved Swipe Experience */}
                            <div className="relative aspect-video sm:aspect-[4/3] bg-[#F5F5F7] overflow-hidden">
                              {imageFiles.length > 0 ? (
                                <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x">
                                  {imageFiles.map((file, idx) => (
                                    <div key={file.id} className="h-full w-full flex-shrink-0 snap-center relative">
                                      <img 
                                        src={file.url} 
                                        alt={`${item.activityName} - ${idx + 1}`} 
                                        className="h-full w-full object-cover pointer-events-none"
                                        loading="lazy"
                                      />
                                      {/* Gradient Overlay for labels */}
                                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#86868B] bg-gray-100">
                                  <ImageIcon size={40} strokeWidth={1} />
                                </div>
                              )}
                              
                              {/* Overlay Actions - Better touch targets */}
                              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none md:group-hover:pointer-events-auto">
                                <button 
                                  onClick={() => onDownload(item)}
                                  className="rounded-2xl bg-white p-4 text-[#1D1D1F] shadow-2xl transition-transform hover:scale-110 active:scale-90 pointer-events-auto"
                                  title="Download Foto"
                                >
                                  <Download size={22} strokeWidth={3} />
                                </button>
                                <button 
                                  onClick={() => onEdit(item)}
                                  className="rounded-2xl bg-white p-4 text-[#1D1D1F] shadow-2xl transition-transform hover:scale-110 active:scale-90 pointer-events-auto"
                                  title="Edit"
                                >
                                  <Edit2 size={22} strokeWidth={3} />
                                </button>
                                <button 
                                  onClick={() => onDelete(item.id)}
                                  className="rounded-2xl bg-red-500 p-4 text-white shadow-2xl transition-transform hover:scale-110 active:scale-90 pointer-events-auto"
                                  title="Hapus"
                                >
                                  <Trash2 size={22} strokeWidth={3} />
                                </button>
                              </div>

                              {/* Navigation Hints & Counters - More visible on Mobile */}
                              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                {imageFiles.length > 1 && (
                                  <div className="flex gap-1 md:hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-xl border border-white/10">
                                  <ImageIcon size={14} />
                                  {imageFiles.length}
                                </div>
                              </div>

                              {/* Mobile Floating Actions Bar (visible only on small screens) */}
                              <div className="absolute top-4 right-4 flex md:hidden gap-2">
                                <button onClick={() => onDownload(item)} className="p-2 rounded-xl bg-white/90 shadow-lg text-black backdrop-blur-md active:bg-blue-50">
                                  <Download size={18} strokeWidth={2.5} />
                                </button>
                                <button onClick={() => onDelete(item.id)} className="p-2 rounded-xl bg-red-500/90 shadow-lg text-white backdrop-blur-md active:bg-red-600">
                                  <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                              </div>

                              {imageFiles.length > 1 && (
                                <div className="absolute bottom-4 left-4 pointer-events-none md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-xl text-[#007AFF] shadow-lg flex items-center gap-1.5 animate-pulse">
                                    <ChevronLeft size={12} strokeWidth={3} /> SWIPE <ChevronRight size={12} strokeWidth={3} />
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex flex-col flex-1">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                                  {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </span>
                                {pdfFiles.length > 0 && (
                                  <div className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                    <FileType size={12} />
                                    {pdfFiles.length} PDF
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="line-clamp-1 text-lg font-black text-[#1D1D1F] md:group-hover:text-[#007AFF] transition-colors leading-snug">
                                {item.activityName}
                              </h4>
                              
                              <p className="mt-2 line-clamp-2 text-sm font-bold leading-relaxed text-[#86868B]">
                                {item.description || 'Tidak ada deskripsi tambahan untuk kegiatan ini.'}
                              </p>
                              
                              <div className="mt-auto pt-4 flex items-center justify-between md:hidden">
                                <button onClick={() => onEdit(item)} className="text-xs font-black text-[#007AFF] uppercase tracking-wider flex items-center gap-1">
                                  <Edit2 size={14} /> Detail
                                </button>
                                <div className="text-[9px] font-black text-gray-300 uppercase">
                                  ID: {item.id.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
