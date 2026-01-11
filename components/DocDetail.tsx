import React from 'react';
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, Download, FileType, Clock } from 'lucide-react';
import { DocumentationItem } from '../types';

interface DocDetailProps {
  item: DocumentationItem;
  onBack: () => void;
  onDownload: (item: DocumentationItem) => void;
}

export const DocDetail: React.FC<DocDetailProps> = ({ item, onBack, onDownload }) => {
  const imageFiles = item.files.filter(f => f.type === 'image');
  const pdfFiles = item.files.filter(f => f.type === 'pdf');

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-10 py-6 md:py-10 animate-fade-in">
      {/* Header Navigation */}
      <div className="mb-6 md:mb-8 flex items-center gap-4 border-b border-black/5 pb-4 md:pb-6">
        <button 
          onClick={onBack} 
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 group-hover:text-black transition-colors" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">DETAIL KEGIATAN</span>
            <span>#{item.id.split('-')[1]}</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-[#1D1D1F] tracking-tight truncate">{item.activityName}</h2>
        </div>
        <button 
          onClick={() => onDownload(item)}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors"
        >
          <Download size={14} /> UNDUH FOTO
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Description */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border border-black/5 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                <Calendar size={12} className="text-blue-500" /> Tanggal Pelaksanaan
              </label>
              <p className="text-sm font-bold text-gray-800">
                {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                <Clock size={12} className="text-purple-500" /> Diunggah Pada
              </label>
              <p className="text-sm font-bold text-gray-800">
                {new Date(item.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-0 space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <FileText size={12} className="text-orange-500" /> Deskripsi
            </label>
            <p className="text-sm md:text-base font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description || "Tidak ada deskripsi tambahan untuk kegiatan ini."}
            </p>
          </div>

          {pdfFiles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-black/5">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <FileType size={12} className="text-red-500" /> Dokumen Terlampir
              </label>
              <div className="space-y-2">
                {pdfFiles.map((file) => (
                  <a 
                    key={file.id} 
                    href={file.url}
                    download={file.name}
                    className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm">
                      <FileType size={16} />
                    </div>
                    <span className="flex-1 text-xs font-bold text-gray-700 truncate">{file.name}</span>
                    <Download size={14} className="text-red-400 group-hover:text-red-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Photo Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <ImageIcon size={12} className="text-green-500" /> Galeri Foto ({imageFiles.length})
            </label>
          </div>

          {imageFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageFiles.map((file, idx) => (
                <div 
                  key={file.id} 
                  className={`relative group rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-black/5 ${idx === 0 ? 'sm:col-span-2 aspect-video' : 'aspect-[4/3]'}`}
                >
                  <img 
                    src={file.url} 
                    alt={`Dokumentasi ${idx + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                    <a 
                      href={file.url} 
                      download={`Foto-${item.activityName}-${idx+1}.jpg`}
                      className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-700 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
                      title="Unduh Foto Ini"
                    >
                      <Download size={16} strokeWidth={3} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <ImageIcon size={48} className="text-gray-300 mb-4" />
              <p className="text-sm font-bold text-gray-400">Tidak ada foto dokumentasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};