
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

  // 1. Filter items based on search
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchTerm]);

  // 2. Group items by Year and then Month
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

  // Get sorted years (newest first)
  const sortedYears = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-full bg-[#FAFAFA]">
      {/* Search & Stats Bar */}
      <div className="sticky top-0 z-[40] flex flex-col gap-4 border-b border-black/5 bg-white/80 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#1D1D1F]">Koleksi Foto</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] bg-black/5 px-3 py-1 rounded-full">
              {filteredItems.length} DOKUMEN
            </span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan judul, deskripsi, atau tanggal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-black/5 pl-10 pr-10 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all border border-transparent focus:border-[#007AFF]/30"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-black"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Content */}
      <div className="p-8 space-y-12">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
              <ImageIcon className="text-[#007AFF]" size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">Tidak Ada Hasil</h3>
            <p className="mt-2 text-sm font-medium text-[#86868B] max-w-xs">
              {searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Mulai tambahkan dokumentasi kegiatan SMPN 3 PACET.'}
            </p>
          </div>
        ) : (
          sortedYears.map(year => (
            <section key={year} className="relative">
              {/* Year Header */}
              <div className="sticky top-[108px] z-[30] -mx-8 mb-6 px-8 py-2 bg-[#FAFAFA]/90 backdrop-blur-sm flex items-center gap-3 border-y border-black/5">
                <span className="text-3xl font-black text-[#1D1D1F] tracking-tighter">{year}</span>
                <div className="h-0.5 flex-1 bg-black/5 rounded-full"></div>
              </div>

              <div className="space-y-10">
                {Object.keys(groupedItems[year]).map(month => (
                  <div key={`${year}-${month}`} className="space-y-4">
                    {/* Month Header */}
                    <div className="flex items-center gap-2 text-[#007AFF]">
                      <CalendarDays size={18} strokeWidth={2.5} />
                      <h3 className="text-lg font-black tracking-tight">{month}</h3>
                      <span className="text-xs font-bold text-[#86868B] ml-2">
                        ({groupedItems[year][month].length} Kegiatan)
                      </span>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {groupedItems[year][month].map((item) => {
                        const imageFiles = item.files.filter(f => f.type === 'image');
                        const pdfFiles = item.files.filter(f => f.type === 'pdf');

                        return (
                          <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-2xl hover:-translate-y-1">
                            
                            {/* Photo Slider Preview */}
                            <div className="relative aspect-[4/3] bg-[#F5F5F7] overflow-hidden">
                              {imageFiles.length > 0 ? (
                                <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing">
                                  {imageFiles.map((file, idx) => (
                                    <div key={file.id} className="h-full w-full flex-shrink-0 snap-center">
                                      <img 
                                        src={file.url} 
                                        alt={`${item.activityName} - ${idx + 1}`} 
                                        className="h-full w-full object-cover pointer-events-none"
                                        loading="lazy"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#86868B]">
                                  <ImageIcon size={48} strokeWidth={1} />
                                </div>
                              )}
                              
                              {/* Overlay Actions */}
                              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                                <button 
                                  onClick={() => onDownload(item)}
                                  className="rounded-full bg-white/90 p-3 text-[#1D1D1F] shadow-lg transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Download size={20} />
                                </button>
                                <button 
                                  onClick={() => onEdit(item)}
                                  className="rounded-full bg-white/90 p-3 text-[#1D1D1F] shadow-lg transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Edit2 size={20} />
                                </button>
                                <button 
                                  onClick={() => onDelete(item.id)}
                                  className="rounded-full bg-red-500/90 p-3 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>

                              {/* Navigation Hints & Counters */}
                              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                {imageFiles.length > 1 && (
                                  <div className="flex gap-1 mr-1">
                                    {imageFiles.slice(0, 5).map((_, i) => (
                                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm"></div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                                  <ImageIcon size={12} />
                                  {imageFiles.length}
                                </div>
                              </div>

                              {imageFiles.length > 1 && (
                                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <span className="bg-white/90 text-[10px] font-black px-2 py-1 rounded-full text-black/70 shadow-sm flex items-center gap-1">
                                    <ChevronLeft size={10} /> GESER <ChevronRight size={10} />
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-5">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                                  {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                              <h4 className="line-clamp-1 text-base font-bold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors leading-tight">
                                {item.activityName}
                              </h4>
                              <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-[#86868B]">
                                {item.description || 'Tanpa deskripsi kegiatan.'}
                              </p>
                              
                              {pdfFiles.length > 0 && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#FF3B30] bg-red-50 w-fit px-2 py-1 rounded-md">
                                  <FileType size={12} />
                                  {pdfFiles.length} PDF
                                </div>
                              )}
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
