import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Download, Image as ImageIcon, FileType, Search, X, ChevronRight, ChevronLeft, CalendarDays, Filter } from 'lucide-react';
import { DocumentationItem } from '../types.ts';

interface DocListProps {
  items: DocumentationItem[];
  onEdit: (item: DocumentationItem) => void;
  onDelete: (id: string) => void;
  onDownload: (item: DocumentationItem) => void;
}

export const DocList: React.FC<DocListProps> = ({ items, onEdit, onDelete, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = selectedYear ? item.date.startsWith(selectedYear) : true;
      return matchSearch && matchYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchTerm, selectedYear]);

  const years = useMemo(() => {
    const y = Array.from(new Set(items.map(item => item.date.split('-')[0]))) as string[];
    return y.sort((a, b) => b.localeCompare(a));
  }, [items]);

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
    <div className="flex h-full bg-[#FAFAFA]">
      {/* Sidebar Kategori */}
      <aside className="hidden md:flex w-64 flex-col border-r border-black/5 bg-[#F2F2F7]/50 backdrop-blur-xl p-6">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-6">Pustaka Waktu</h3>
        <nav className="space-y-1">
          <button 
            type="button"
            onClick={() => setSelectedYear(null)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!selectedYear ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-black/5'}`}
          >
            Semua Foto
          </button>
          {years.map(year => (
            <button 
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedYear === year ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-black/5'}`}
            >
              Tahun {year}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto p-4 bg-white/40 rounded-2xl border border-white shadow-inner">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <ImageIcon size={16} />
            </div>
            <span className="text-xs font-black text-gray-800">Status</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Total: {items.length} Kegiatan</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="sticky top-0 z-[40] border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur-xl flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
            <input 
              type="text" 
              placeholder="Cari dokumentasi kegiatan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-black/5 pl-12 pr-10 py-3 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-500/20 shadow-inner"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button className="p-3 bg-black/5 rounded-2xl"><Filter size={18} /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10 space-y-12">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-black/5">
                  <ImageIcon className="text-blue-500" size={40} />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Belum Ada Dokumentasi</h3>
              <p className="mt-2 text-sm font-bold text-gray-400 max-w-xs mx-auto">Mulai tambahkan foto kegiatan sekolah untuk membangun arsip digital.</p>
            </div>
          ) : (
            sortedYears.map(year => (
              <section key={year} className="space-y-10">
                {Object.keys(groupedItems[year]).map(month => (
                  <div key={`${year}-${month}`} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-black/5 pb-3">
                      <h3 className="text-xl font-black tracking-tight text-gray-800">{month} {year}</h3>
                      <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{groupedItems[year][month].length} Sesi</span>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedItems[year][month].map((item) => {
                        const imageFiles = item.files.filter(f => f.type === 'image');
                        return (
                          <div key={item.id} className="group flex flex-col bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 ring-1 ring-black/5 overflow-hidden animate-scale-in">
                            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                              {imageFiles.length > 0 ? (
                                <img src={imageFiles[0].url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-300"><ImageIcon size={48} strokeWidth={1} /></div>
                              )}
                              
                              {/* Action Buttons Overlay - Simplified event handling */}
                              <div className="absolute inset-0 z-20 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                                  className="p-3 bg-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all text-blue-600 cursor-pointer pointer-events-auto z-30" 
                                  title="Edit"
                                >
                                  <Edit2 size={18} strokeWidth={3} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onDownload(item); }} 
                                  className="p-3 bg-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all text-emerald-600 cursor-pointer pointer-events-auto z-30" 
                                  title="Download Foto"
                                >
                                  <Download size={18} strokeWidth={3} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                                  className="p-3 bg-red-500 rounded-xl shadow-xl hover:bg-red-600 transition-colors text-white cursor-pointer pointer-events-auto z-30" 
                                  title="Hapus"
                                >
                                  <Trash2 size={18} strokeWidth={3} />
                                </button>
                              </div>

                              <div className="absolute bottom-4 right-4 flex items-center gap-2 md:opacity-100 opacity-0 transition-opacity z-10 pointer-events-none">
                                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                                  <ImageIcon size={12} /> {imageFiles.length}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1 relative z-10 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long' })}</span>
                                <span className="text-[9px] font-black text-gray-300">#{item.id.split('-')[1]?.substring(0,6)}</span>
                              </div>
                              <h4 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.activityName}</h4>
                              <p className="mt-2 text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed italic">{item.description || 'Kegiatan sekolah...'}</p>
                              
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="mt-6 flex items-center gap-2 text-xs font-black text-blue-600 hover:gap-3 transition-all w-fit"
                              >
                                LIHAT DETAIL <ChevronRight size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};