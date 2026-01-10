import React, { useState } from 'react';
import { Edit2, Trash2, Download, Image as ImageIcon, Calendar, FileType, Search, X } from 'lucide-react';
import { DocumentationItem } from '../types';

interface DocListProps {
  items: DocumentationItem[];
  onEdit: (item: DocumentationItem) => void;
  onDelete: (id: string) => void;
  onDownload: (item: DocumentationItem) => void;
}

export const DocList: React.FC<DocListProps> = ({ items, onEdit, onDelete, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.date.includes(searchTerm)
  );

  return (
    <div className="min-h-full bg-[#FAFAFA]">
      {/* Search & Stats Bar */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-black/5 bg-white/80 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#1D1D1F]">Koleksi Foto</h2>
          <span className="text-xs font-bold uppercase tracking-widest text-[#86868B]">
            {items.length} ITEM
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
          <input 
            type="text" 
            placeholder="Cari foto atau kegiatan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-black/5 pl-10 pr-10 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all border border-transparent focus:border-[#007AFF]/30"
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

      {/* Grid Content */}
      <div className="p-8">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
              <ImageIcon className="text-[#007AFF]" size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F]">Tidak Ada Foto</h3>
            <p className="mt-2 text-sm font-medium text-[#86868B] max-w-xs">
              Mulai tambahkan dokumentasi kegiatan SMPN 3 PACET untuk melihat arsip di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const imageFiles = item.files.filter(f => f.type === 'image');
              const pdfFiles = item.files.filter(f => f.type === 'pdf');

              return (
                <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-2xl hover:-translate-y-1">
                  {/* Photo Stack Preview */}
                  <div className="relative aspect-[4/3] bg-[#E5E5E5]">
                    {imageFiles.length > 0 ? (
                      <img 
                        src={imageFiles[0].url} 
                        alt={item.activityName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#86868B]">
                        <ImageIcon size={48} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Badge Count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                      <ImageIcon size={12} />
                      {imageFiles.length}
                    </div>

                    {/* Quick Actions Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
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
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#007AFF]">
                        {new Date(item.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="line-clamp-1 text-base font-bold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
                      {item.activityName}
                    </h4>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-[#86868B]">
                      {item.description || 'Tidak ada deskripsi.'}
                    </p>
                    
                    {pdfFiles.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#FF3B30]">
                        <FileType size={14} />
                        {pdfFiles.length} Dokumen PDF terlampir
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};