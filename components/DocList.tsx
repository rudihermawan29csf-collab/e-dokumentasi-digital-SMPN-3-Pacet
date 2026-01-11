import React, { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Image as ImageIcon, Search, X, ChevronRight, ChevronDown, Filter, Eye, FolderOpen, Calendar, MoreHorizontal } from 'lucide-react';
import { DocumentationItem } from '../types.ts';

interface DocListProps {
  items: DocumentationItem[];
  onEdit: (item: DocumentationItem) => void;
  onView: (item: DocumentationItem) => void;
  onDelete: (id: string) => void;
  onDownload: (item: DocumentationItem) => void;
}

export const DocList: React.FC<DocListProps> = ({ items, onEdit, onView, onDelete, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  
  // State untuk accordion Bulan/Tahun
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  // State untuk accordion Nama Kegiatan
  const [expandedActivityKeys, setExpandedActivityKeys] = useState<Set<string>>(new Set());
  
  const [hasInitialized, setHasInitialized] = useState(false);

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

  // Initialize first Month group as expanded on load
  useEffect(() => {
    if (!hasInitialized && sortedYears.length > 0) {
      const firstYear = sortedYears[0];
      const months = Object.keys(groupedItems[firstYear]);
      if (months.length > 0) {
        const firstGroupKey = `${firstYear}-${months[0]}`;
        setExpandedGroupKeys(new Set([firstGroupKey]));
        
        // Opsional: Jika ingin kegiatan pertama otomatis terbuka juga
        // const firstItems = groupedItems[firstYear][months[0]];
        // if (firstItems.length > 0) {
        //   setExpandedActivityKeys(new Set([firstItems[0].id]));
        // }
      }
      setHasInitialized(true);
    }
  }, [sortedYears, groupedItems, hasInitialized]);

  const toggleGroupAccordion = (key: string) => {
    const newSet = new Set(expandedGroupKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedGroupKeys(newSet);
  };

  const toggleActivityAccordion = (id: string) => {
    const newSet = new Set(expandedActivityKeys);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedActivityKeys(newSet);
  };

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      {/* Sidebar Kategori */}
      <aside className="hidden md:flex w-56 flex-col border-r border-black/5 bg-[#F2F2F7]/50 backdrop-blur-xl p-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E8E93] mb-4">Pustaka Waktu</h3>
        <nav className="space-y-0.5">
          <button 
            type="button"
            onClick={() => setSelectedYear(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${!selectedYear ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-black/5'}`}
          >
            Semua Foto
          </button>
          {years.map(year => (
            <button 
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedYear === year ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-600 hover:bg-black/5'}`}
            >
              Tahun {year}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto p-3 bg-white/40 rounded-xl border border-white shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ImageIcon size={12} />
            </div>
            <span className="text-[10px] font-black text-gray-800">Status</span>
          </div>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Total: {items.length} Kegiatan</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="sticky top-0 z-[40] border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868B]" />
            <input 
              type="text" 
              placeholder="Cari nama kegiatan atau deskripsi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-black/5 pl-9 pr-8 py-2 text-xs font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-500/20 shadow-inner"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button className="p-2 bg-black/5 rounded-xl"><Filter size={16} /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5">
                  <FolderOpen className="text-blue-500" size={32} />
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Belum Ada Dokumentasi</h3>
              <p className="mt-1 text-xs font-bold text-gray-400 max-w-xs mx-auto">Mulai tambahkan foto kegiatan sekolah.</p>
            </div>
          ) : (
            sortedYears.map(year => (
              <div key={year} className="space-y-4">
                {!selectedYear && sortedYears.length > 1 && (
                   <div className="sticky top-0 z-10 px-2 py-1 bg-[#FAFAFA]/90 backdrop-blur-sm">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tahun {year}</h2>
                   </div>
                )}
                
                {Object.keys(groupedItems[year]).map(month => {
                  const groupKey = `${year}-${month}`;
                  const isGroupExpanded = expandedGroupKeys.has(groupKey);
                  const itemsInGroup = groupedItems[year][month];
                  
                  return (
                    <div key={groupKey} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden transition-all duration-300">
                      
                      {/* LEVEL 1: Accordion Header (Bulan) */}
                      <button 
                        onClick={() => toggleGroupAccordion(groupKey)}
                        className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-transparent ${isGroupExpanded ? 'bg-gray-50/80 border-black/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-white shadow-sm ring-1 ring-black/5 text-gray-400 transition-transform duration-300 ${isGroupExpanded ? 'rotate-90 text-blue-500' : ''}`}>
                             <ChevronRight size={16} strokeWidth={3} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{month} {year}</h3>
                            <p className="text-[10px] font-bold text-gray-400">{itemsInGroup.length} Kegiatan</p>
                          </div>
                        </div>
                        
                        {/* Preview Avatars for Group (Shown when collapsed) */}
                        {!isGroupExpanded && (
                           <div className="flex -space-x-2 mr-2">
                              {itemsInGroup.slice(0, 4).map((i) => {
                                const img = i.files.find(f => f.type === 'image');
                                return (
                                  <div key={i.id} className="w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden shadow-sm">
                                    {img ? (
                                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center"><ImageIcon size={12} className="text-gray-400"/></div>
                                    )}
                                  </div>
                                );
                              })}
                           </div>
                        )}
                      </button>

                      {/* LEVEL 1 Body: List of Activities */}
                      {isGroupExpanded && (
                        <div className="bg-[#FAFAFA]/50 animate-fade-in p-2 space-y-2">
                          {itemsInGroup.map(item => {
                             const isActivityExpanded = expandedActivityKeys.has(item.id);
                             const imageFiles = item.files.filter(f => f.type === 'image');
                             const day = new Date(item.date).getDate();
                             const dayName = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });

                             return (
                               <div key={item.id} className={`group border border-black/5 rounded-xl bg-white overflow-hidden transition-all duration-300 ${isActivityExpanded ? 'shadow-md ring-1 ring-blue-500/20' : 'hover:shadow-sm'}`}>
                                  
                                  {/* LEVEL 2: Accordion Header (Nama Kegiatan) */}
                                  <div 
                                    onClick={() => toggleActivityAccordion(item.id)}
                                    className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                  >
                                    {/* Date Badge */}
                                    <div className={`flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-black/5 transition-colors ${isActivityExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-500 group-hover:bg-white'}`}>
                                       <span className="text-[8px] font-black uppercase tracking-wider">{dayName}</span>
                                       <span className="text-sm md:text-lg font-black leading-none">{day}</span>
                                    </div>

                                    {/* Title & Info */}
                                    <div className="flex-1 min-w-0">
                                       <h4 className={`text-xs md:text-sm font-black truncate transition-colors ${isActivityExpanded ? 'text-blue-600' : 'text-gray-800'}`}>{item.activityName}</h4>
                                       <p className="text-[10px] font-medium text-gray-500 truncate mt-0.5">{item.description || 'Tidak ada deskripsi'}</p>
                                    </div>

                                    {/* Actions & Chevron */}
                                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                       {/* Preview Avatars (Shown when activity collapsed) */}
                                       {!isActivityExpanded && imageFiles.length > 0 && (
                                          <div className="hidden sm:flex -space-x-1.5 opacity-60">
                                             {imageFiles.slice(0, 3).map((f, idx) => (
                                                <div key={idx} className="w-6 h-6 rounded-md ring-1 ring-white bg-gray-100 overflow-hidden">
                                                   <img src={f.url} className="w-full h-full object-cover" />
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                       
                                       <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onView(item); }}
                                            className="p-1.5 rounded-md hover:bg-white hover:text-blue-600 hover:shadow-sm text-gray-400 transition-all"
                                            title="Lihat Detail"
                                          >
                                             <Eye size={14} strokeWidth={2.5} />
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                            className="p-1.5 rounded-md hover:bg-white hover:text-orange-500 hover:shadow-sm text-gray-400 transition-all"
                                            title="Edit"
                                          >
                                             <Edit2 size={14} strokeWidth={2.5} />
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                            className="p-1.5 rounded-md hover:bg-white hover:text-red-500 hover:shadow-sm text-gray-400 transition-all"
                                            title="Hapus"
                                          >
                                             <Trash2 size={14} strokeWidth={2.5} />
                                          </button>
                                       </div>

                                       <div className={`text-gray-300 transition-transform duration-300 ${isActivityExpanded ? 'rotate-180 text-blue-500' : ''}`}>
                                          <ChevronDown size={16} strokeWidth={3} />
                                       </div>
                                    </div>
                                  </div>

                                  {/* LEVEL 2 Body: Photo Grid */}
                                  {isActivityExpanded && (
                                    <div className="p-4 border-t border-black/5 bg-gray-50/50 animate-scale-in origin-top">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                             <ImageIcon size={12} /> Galeri Foto ({imageFiles.length})
                                          </span>
                                          <button 
                                            onClick={() => onView(item)}
                                            className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                                          >
                                             Lihat Detail Penuh <ChevronRight size={10} />
                                          </button>
                                       </div>
                                       
                                       {imageFiles.length > 0 ? (
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                             {imageFiles.map((file, idx) => (
                                                <div 
                                                  key={file.id} 
                                                  className="relative group aspect-square rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 cursor-pointer hover:shadow-md transition-all"
                                                  onClick={() => onView(item)}
                                                >
                                                   <img src={file.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                             ))}
                                          </div>
                                       ) : (
                                          <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                             <p className="text-[10px] font-bold text-gray-400">Tidak ada foto.</p>
                                          </div>
                                       )}
                                    </div>
                                  )}
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};